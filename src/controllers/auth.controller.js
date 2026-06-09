const authService = require('../services/auth.service');
const { success } = require('../utils/response');

async function register(ctx) {
  const data = await authService.register(ctx.state.validatedBody);
  ctx.status = 201;
  ctx.body = success(data);
}

async function login(ctx) {
  const data = await authService.login(ctx.state.validatedBody);
  ctx.body = success(data);
}

async function profile(ctx) {
  const data = await authService.getProfile(ctx.state.user.userId);
  ctx.body = success(data);
}

module.exports = {
  register,
  login,
  profile,
};
