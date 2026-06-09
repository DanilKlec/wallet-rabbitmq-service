const walletService = require('../services/wallet.service');
const { success } = require('../utils/response');

async function getWallet(ctx) {
  const data = await walletService.getWallet(ctx.state.user.userId);
  ctx.body = success(data);
}

module.exports = {
  getWallet,
};
