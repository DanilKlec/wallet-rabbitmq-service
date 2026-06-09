const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/app-error');

async function authMiddleware(ctx, next) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authorization token is required', 401);
  }

  const token = authHeader.slice(7);

  try {
    console.log('AUTH HEADER:', authHeader);
console.log('TOKEN:', token);
    const decoded = jwt.verify(token, config.jwt.secret);
    ctx.state.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    await next();
  } catch (error) {
  console.error('JWT VERIFY ERROR:', error);
  throw new AppError(error.message, 401);
}
}

module.exports = authMiddleware;
