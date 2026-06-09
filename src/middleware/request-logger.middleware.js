const logger = require('../utils/logger');

async function requestLogger(ctx, next) {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  logger.request(ctx.method, ctx.url, duration);
}

module.exports = requestLogger;
