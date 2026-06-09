require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  grpcPort: parseInt(process.env.GRPC_PORT, 10) || 50051,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'wallet',
    user: process.env.DB_USER || 'wallet',
    password: process.env.DB_PASSWORD || 'wallet',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 60,
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'wallet.events',
    queue: process.env.RABBITMQ_QUEUE || 'wallet.audit',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'wallet-super-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
};
