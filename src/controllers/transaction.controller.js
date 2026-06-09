const transactionService = require('../services/transaction.service');
const { success } = require('../utils/response');

async function deposit(ctx) {
  const data = await transactionService.deposit(ctx.state.user.userId, ctx.state.validatedBody);
  ctx.status = 201;
  ctx.body = success(data);
}

async function withdraw(ctx) {
  const data = await transactionService.withdraw(ctx.state.user.userId, ctx.state.validatedBody);
  ctx.status = 201;
  ctx.body = success(data);
}

async function transfer(ctx) {
  const data = await transactionService.transfer(ctx.state.user.userId, ctx.state.validatedBody);
  ctx.status = 201;
  ctx.body = success(data);
}

async function getHistory(ctx) {
  const data = await transactionService.getHistory(ctx.state.user.userId, ctx.state.validatedQuery);
  ctx.body = success(data);
}

module.exports = {
  deposit,
  withdraw,
  transfer,
  getHistory,
};
