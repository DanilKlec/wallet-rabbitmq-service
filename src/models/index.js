const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'postgres',
  logging: false,
});

const User = require('./user.model')(sequelize);
const Wallet = require('./wallet.model')(sequelize);
const Transaction = require('./transaction.model')(sequelize);
const AuditLog = require('./audit-log.model')(sequelize);

User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

module.exports = { sequelize, User, Wallet, Transaction, AuditLog };
