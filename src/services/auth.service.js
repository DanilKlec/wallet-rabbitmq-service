const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../models');
const config = require('../config');
const AppError = require('../utils/app-error');
const userRepository = require('../repositories/user.repository');
const walletRepository = require('../repositories/wallet.repository');
const cache = require('../cache');

async function register({ email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new AppError('User with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const transaction = await sequelize.transaction();

  try {
    const user = await userRepository.create({ email, passwordHash }, transaction);
    const wallet = await walletRepository.create(
      { userId: user.id, balance: '0.00000000' },
      transaction
    );
    await transaction.commit();

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return {
      token,
      user: { id: user.id, email: user.email },
      wallet: { id: wallet.id, balance: wallet.balance },
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  return { token, user: { id: user.id, email: user.email } };
}

async function getProfile(userId) {
  const cached = await cache.getProfile(userId);
  if (cached) return cached;

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const profile = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  await cache.setProfile(userId, profile);
  return profile;
}

module.exports = { register, login, getProfile };
