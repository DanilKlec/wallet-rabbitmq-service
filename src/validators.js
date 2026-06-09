const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const amountSchema = Joi.number()
  .positive()
  .precision(8)
  .required()
  .messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be greater than zero',
    'any.required': 'Amount is required',
  });

const depositSchema = Joi.object({
  amount: amountSchema,
  description: Joi.string()
  .trim()
  .max(500)
  .allow('')
  .default(''),
});

const withdrawSchema = Joi.object({
  amount: amountSchema,
  description: Joi.string()
  .trim()
  .max(500)
  .allow('')
  .default(''),
});

const transferSchema = Joi.object({
  toUserId: Joi.string().uuid().required().messages({
    'string.guid': 'Recipient user ID must be a valid UUID',
    'any.required': 'Recipient user ID is required',
  }),
  amount: amountSchema,
  description: Joi.string()
  .trim()
  .max(500)
  .allow('')
  .default(''),
});

const historyQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid('deposit', 'withdraw', 'transfer_in', 'transfer_out').optional(),
  sort: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  registerSchema,
  loginSchema,
  depositSchema,
  withdrawSchema,
  transferSchema,
  historyQuerySchema,
};
