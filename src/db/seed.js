const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, Wallet } = require('../models');
const logger = require('../utils/logger');

async function seedDemoUsers() {
  const count = await User.count();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash('password123', 12);

  const alice = await User.create({
    id: crypto.randomUUID(),
    email: 'alice@example.com',
    passwordHash,
  });

  const bob = await User.create({
    id: crypto.randomUUID(),
    email: 'bob@example.com',
    passwordHash,
  });

  await Wallet.bulkCreate([
    { id: crypto.randomUUID(), userId: alice.id, balance: '1000.00000000' },
    { id: crypto.randomUUID(), userId: bob.id, balance: '500.00000000' },
  ]);

  logger.info('Demo users seeded: alice@example.com, bob@example.com / password123');
}

module.exports = { seedDemoUsers };
