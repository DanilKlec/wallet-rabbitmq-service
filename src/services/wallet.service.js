const AppError = require('../utils/app-error');
const { formatDecimal } = require('../utils/decimal');
const walletRepository = require('../repositories/wallet.repository');
const cache = require('../cache');

async function getWallet(userId) {
  const cachedBalance = await cache.getBalance(userId);
  const wallet = await walletRepository.findByUserId(userId);

  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }

  const balance = formatDecimal(wallet.balance);
  if (!cachedBalance) {
    await cache.setBalance(userId, balance);
  }

  return { walletId: wallet.id, balance: cachedBalance || balance };
}

async function getBalanceByUserId(userId) {
  const wallet = await walletRepository.findByUserId(userId);
  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }
  return formatDecimal(wallet.balance);
}

async function getWalletInfoByUserId(userId) {
  const wallet = await walletRepository.findByUserId(userId);
  if (!wallet) {
    throw new AppError('Wallet not found', 404);
  }
  return { walletId: wallet.id, balance: formatDecimal(wallet.balance) };
}

module.exports = { getWallet, getBalanceByUserId, getWalletInfoByUserId };
