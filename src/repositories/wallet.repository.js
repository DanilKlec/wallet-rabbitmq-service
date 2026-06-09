const { Wallet } = require('../models');

async function create(data, transaction = null) {
  return Wallet.create(data, transaction ? { transaction } : {});
}

async function findByUserId(userId) {
  return Wallet.findOne({ where: { userId } });
}

async function findById(id, transaction = null, lock = false) {
  const options = { transaction };

  if (lock && transaction) {
    options.lock = transaction.LOCK.UPDATE;
  }

  return Wallet.findByPk(id, options);
}

async function updateBalance(id, balance, transaction = null) {
  const [affected] = await Wallet.update(
    { balance },
    {
      where: { id },
      transaction,
    }
  );

  return affected > 0;
}

module.exports = {
  create,
  findByUserId,
  findById,
  updateBalance,
};
