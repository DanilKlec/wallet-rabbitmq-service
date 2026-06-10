const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
  './src/grpc/proto/wallet.proto',
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const walletProto =
  grpc.loadPackageDefinition(packageDefinition).wallet;

const client = new walletProto.WalletInfoService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);
const request = {
  user_id: '631624df-6541-41c1-9be7-fa6f6b50cd6a'
};
console.log(request);
client.GetBalance(
  request,
  (err, response) => {
    console.log(err || response);
  }
);