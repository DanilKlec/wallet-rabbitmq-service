const http = require('http');
const config = require('./config');
const app = require('./app');
const { sequelize } = require('./models');
const cache = require('./cache');
const queues = require('./queues');
const { startGrpcServer } = require('./grpc/server');
const { syncDatabase } = require('./db/sync');
const { seedDemoUsers } = require('./db/seed');
const logger = require('./utils/logger');

let httpServer;
let grpcServer;

async function start() {
  await sequelize.authenticate();
  await syncDatabase(sequelize);
  logger.info('PostgreSQL connected, schema synced');

  if (process.env.SEED_DEMO === 'true') {
    await seedDemoUsers();
  }

  await cache.connect();
  logger.info('Redis connected');

  await queues.startConsumer();
  grpcServer = await startGrpcServer();

  httpServer = http.createServer(app.callback());
  httpServer.listen(config.port, () => {
    logger.info(`HTTP server: http://localhost:${config.port}`);
    logger.info(`Swagger: http://localhost:${config.port}/api-docs`);
  });
}

async function shutdown(signal) {
  logger.info(`Shutting down (${signal})...`);

  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
  if (grpcServer) {
    await new Promise((resolve) => grpcServer.tryShutdown(resolve));
  }

  await queues.close();
  await cache.disconnect();
  await sequelize.close();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch((err) => {
  logger.error(err);
  if (err.name === 'SequelizeConnectionError') {
    console.error(
      '\nHint: start infrastructure with "docker-compose up -d postgres redis rabbitmq"' +
        '\n       and check DB_HOST/DB_PORT in .env (Docker Postgres uses port 5433)\n'
    );
  }
  process.exit(1);
});
