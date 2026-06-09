const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Transaction',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      walletId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'wallet_id',
      },
      type: {
        type: DataTypes.ENUM('deposit', 'withdraw', 'transfer_in', 'transfer_out'),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(18, 8),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: 'transactions',
      underscored: true,
      updatedAt: false,
    }
  );
};
