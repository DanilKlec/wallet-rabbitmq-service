const { sequelize } = require('../models');
const cache = require('../cache');
const { success } = require('../utils/response');

async function health(ctx) {
  let dbOk = true;
  let redisOk = true;

  try {
    await sequelize.authenticate();
  } catch {
    dbOk = false;
  }

  try {
    await cache.getRedis().ping();
  } catch {
    redisOk = false;
  }

  const isHealthy = dbOk && redisOk;
  ctx.status = isHealthy ? 200 : 503;
  ctx.body = success({
    status: isHealthy ? 'healthy' : 'degraded',
    database: dbOk ? 'ok' : 'error',
    redis: redisOk ? 'ok' : 'error',
  });
}

module.exports = { health };
