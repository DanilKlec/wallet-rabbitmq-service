const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const config = require('../config');
const logger = require('../utils/logger');
const walletService = require('../services/wallet.service');

const PROTO_PATH = path.join(__dirname, 'proto', 'wallet.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const walletProto = grpc.loadPackageDefinition(packageDefinition).wallet;

async function getBalance(call, callback) {
  try {
    const { user_id: userId } = call.request;
    const balance = await walletService.getBalanceByUserId(userId);
    callback(null, { balance });
  } catch (err) {
    callback({
      code: grpc.status.NOT_FOUND,
      message: err.message,
    });
  }
}

async function getWalletByUserId(call, callback) {
  try {
    const { user_id: userId } = call.request;
    const wallet = await walletService.getWalletInfoByUserId(userId);
    callback(null, {
      wallet_id: wallet.walletId,
      balance: wallet.balance,
    });
  } catch (err) {
    callback({
      code: grpc.status.NOT_FOUND,
      message: err.message,
    });
  }
}

function startGrpcServer() {
  const server = new grpc.Server();

  server.addService(walletProto.WalletInfoService.service, {
    GetBalance: getBalance,
    GetWalletByUserId: getWalletByUserId,
  });

  return new Promise((resolve, reject) => {
    server.bindAsync(
      `0.0.0.0:${config.grpcPort}`,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          reject(err);
          return;
        }

        logger.info(`gRPC server running on port ${port}`);
        resolve(server);
      }
    );
  });
}

module.exports = {
  startGrpcServer,
};
