const { Transaction } = require('../models');

async function create(data, transaction = null) {
  return Transaction.create(data, transaction ? { transaction } : {});
}

async function findByWalletId(walletId, options = {}) {
  const { page = 1, limit = 20, type = null, sort = 'desc' } = options;

  const where = { walletId };

  if (type) {
    where.type = type;
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    order: [['createdAt', sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC']],
    limit,
    offset,
  });

  return {
    items: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

module.exports = {
  create,
  findByWalletId,
};
