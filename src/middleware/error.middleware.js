const logger = require('../utils/logger');
const { error } = require('../utils/response');

async function errorMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    logger.error(err);

    const statusCode = err.statusCode || err.status || 500;
    const message = err.isOperational ? err.message : 'Internal server error';

    ctx.status = statusCode;
    ctx.body = error(message);
  }
}

module.exports = errorMiddleware;
