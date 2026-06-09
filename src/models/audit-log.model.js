const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      eventType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'event_type',
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    },
    {
      tableName: 'audit_logs',
      underscored: true,
      updatedAt: false,
      indexes: [
        { fields: ['event_type'], name: 'audit_logs_event_type_idx' },
        { fields: ['created_at'], name: 'audit_logs_created_at_idx' },
      ],
    }
  );

  return AuditLog;
};
