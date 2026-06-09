const AppError = require('../utils/app-error');

function validate(schema, source = 'body') {
  return async (ctx, next) => {
    const data = source === 'query' ? ctx.query : ctx.request.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      throw new AppError(message, 400);
    }

    if (source === 'query') {
      ctx.state.validatedQuery = value;
    } else {
      ctx.state.validatedBody = value;
    }

    await next();
  };
}

module.exports = validate;
