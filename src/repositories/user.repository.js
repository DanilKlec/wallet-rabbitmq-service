const { User } = require('../models');

async function create(data, transaction = null) {
  return User.create(data, transaction ? { transaction } : {});
}

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function findById(id) {
  return User.findByPk(id, {
    attributes: ['id', 'email', 'createdAt', 'updatedAt'],
  });
}

module.exports = {
  create,
  findByEmail,
  findById,
};
