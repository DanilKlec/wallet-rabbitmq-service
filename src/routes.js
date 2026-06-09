const Router = require('@koa/router');
const authController = require('./controllers/auth.controller');
const walletController = require('./controllers/wallet.controller');
const transactionController = require('./controllers/transaction.controller');
const { health } = require('./controllers/health.controller');
const authMiddleware = require('./middleware/auth.middleware');
const validate = require('./middleware/validate.middleware');
const {
  registerSchema,
  loginSchema,
  depositSchema,
  withdrawSchema,
  transferSchema,
  historyQuerySchema,
} = require('./validators');

const router = new Router();

router.get('/health', health);

router.post('/auth/register', validate(registerSchema), authController.register);
router.post('/auth/login', validate(loginSchema), authController.login);
router.get('/auth/profile', authMiddleware, authController.profile);

router.get('/wallet', authMiddleware, walletController.getWallet);

router.get(
  '/transactions',
  authMiddleware,
  validate(historyQuerySchema, 'query'),
  transactionController.getHistory
);
router.post('/transactions/deposit', authMiddleware, validate(depositSchema), transactionController.deposit);
router.post('/transactions/withdraw', authMiddleware, validate(withdrawSchema), transactionController.withdraw);
router.post('/transactions/transfer', authMiddleware, validate(transferSchema), transactionController.transfer);

module.exports = router;
