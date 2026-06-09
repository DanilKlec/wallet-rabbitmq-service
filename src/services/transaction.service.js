const { sequelize } = require('../models');
const AppError = require('../utils/app-error');
const { toDecimal, formatDecimal, isPositive } = require('../utils/decimal');
const walletRepository = require('../repositories/wallet.repository');
const userRepository = require('../repositories/user.repository');
const transactionRepository = require('../repositories/transaction.repository');
const cache = require('../cache');
const { publishTransactionCreated } = require('../queues');

const TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  TRANSFER_IN: 'transfer_in',
  TRANSFER_OUT: 'transfer_out',
};

async function deposit(userId, { amount, description }) {
  if (!isPositive(amount)) {
    throw new AppError('Amount must be greater than zero', 400);
  }

  const wallet = await walletRepository.findByUserId(userId);
  if (!wallet) throw new AppError('Wallet not found', 404);

  const transaction = await sequelize.transaction();

  try {
    const locked = await walletRepository.findById(wallet.id, transaction, true);
    const newBalance = toDecimal(locked.balance).plus(amount);

    await walletRepository.updateBalance(wallet.id, formatDecimal(newBalance), transaction);

    const record = await transactionRepository.create(
      {
        walletId: wallet.id,
        type: TYPES.DEPOSIT,
        amount: formatDecimal(amount),
        description: description || 'Deposit',
      },
      transaction
    );

    await transaction.commit();
    await cache.invalidateBalance(userId);
    await publishTransactionCreated(buildEvent(record, userId));

    return {
      transactionId: record.id,
      type: record.type,
      amount: formatDecimal(record.amount),
      balance: formatDecimal(newBalance),
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function withdraw(userId, { amount, description }) {
  if (!isPositive(amount)) {
    throw new AppError('Amount must be greater than zero', 400);
  }

  const wallet = await walletRepository.findByUserId(userId);
  if (!wallet) throw new AppError('Wallet not found', 404);

  const transaction = await sequelize.transaction();

  try {
    const locked = await walletRepository.findById(wallet.id, transaction, true);
    const currentBalance = toDecimal(locked.balance);
    const withdrawAmount = toDecimal(amount);

    if (currentBalance.lessThan(withdrawAmount)) {
      throw new AppError('Insufficient funds', 400);
    }

    const newBalance = currentBalance.minus(withdrawAmount);
    await walletRepository.updateBalance(wallet.id, formatDecimal(newBalance), transaction);

    const record = await transactionRepository.create(
      {
        walletId: wallet.id,
        type: TYPES.WITHDRAW,
        amount: formatDecimal(amount),
        description: description || 'Withdrawal',
      },
      transaction
    );

    await transaction.commit();
    await cache.invalidateBalance(userId);
    await publishTransactionCreated(buildEvent(record, userId));

    return {
      transactionId: record.id,
      type: record.type,
      amount: formatDecimal(record.amount),
      balance: formatDecimal(newBalance),
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function transfer(senderUserId, { toUserId, amount, description }) {
  if (senderUserId === toUserId) {
    throw new AppError('Cannot transfer to yourself', 400);
  }
  if (!isPositive(amount)) {
    throw new AppError('Amount must be greater than zero', 400);
  }

  const recipient = await userRepository.findById(toUserId);
  if (!recipient) throw new AppError('Recipient user not found', 404);

  const senderWallet = await walletRepository.findByUserId(senderUserId);
  const recipientWallet = await walletRepository.findByUserId(toUserId);
  if (!senderWallet || !recipientWallet) {
    throw new AppError('Wallet not found', 404);
  }

  const transaction = await sequelize.transaction();

  try {
    const lockedSender = await walletRepository.findById(senderWallet.id, transaction, true);
    const lockedRecipient = await walletRepository.findById(recipientWallet.id, transaction, true);

    const senderBalance = toDecimal(lockedSender.balance);
    const transferAmount = toDecimal(amount);

    if (senderBalance.lessThan(transferAmount)) {
      throw new AppError('Insufficient funds', 400);
    }

    const newSenderBalance = senderBalance.minus(transferAmount);
    const newRecipientBalance = toDecimal(lockedRecipient.balance).plus(transferAmount);

    await walletRepository.updateBalance(
      senderWallet.id,
      formatDecimal(newSenderBalance),
      transaction
    );
    await walletRepository.updateBalance(
      recipientWallet.id,
      formatDecimal(newRecipientBalance),
      transaction
    );

    const transferOut = await transactionRepository.create(
      {
        walletId: senderWallet.id,
        type: TYPES.TRANSFER_OUT,
        amount: formatDecimal(amount),
        description: description || `Transfer to user ${toUserId}`,
      },
      transaction
    );

    const transferIn = await transactionRepository.create(
      {
        walletId: recipientWallet.id,
        type: TYPES.TRANSFER_IN,
        amount: formatDecimal(amount),
        description: description || `Transfer from user ${senderUserId}`,
      },
      transaction
    );

    await transaction.commit();
    await cache.invalidateBalances([senderUserId, toUserId]);
    await publishTransactionCreated(buildEvent(transferOut, senderUserId));
    await publishTransactionCreated(buildEvent(transferIn, toUserId));

    return {
      transferOutId: transferOut.id,
      transferInId: transferIn.id,
      amount: formatDecimal(amount),
      balance: formatDecimal(newSenderBalance),
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function getHistory(userId, query) {
  const wallet = await walletRepository.findByUserId(userId);
  if (!wallet) throw new AppError('Wallet not found', 404);

  const result = await transactionRepository.findByWalletId(wallet.id, query);

  return {
    ...result,
    items: result.items.map((item) => ({
      id: item.id,
      walletId: item.walletId,
      type: item.type,
      amount: formatDecimal(item.amount),
      description: item.description,
      createdAt: item.createdAt,
    })),
  };
}

function buildEvent(record, userId) {
  return {
    eventType: 'transaction.created',
    transactionId: record.id,
    walletId: record.walletId,
    userId,
    type: record.type,
    amount: formatDecimal(record.amount),
    description: record.description,
    createdAt: record.createdAt,
  };
}

module.exports = { deposit, withdraw, transfer, getHistory };
