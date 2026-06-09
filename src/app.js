const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const { koaSwagger } = require('koa2-swagger-ui');
const swaggerSpec = require('./docs/swagger.json');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error.middleware');
const requestLogger = require('./middleware/request-logger.middleware');

const app = new Koa();

app.use(errorMiddleware);
app.use(cors());
app.use(requestLogger);
app.use(bodyParser());

app.use(
  koaSwagger({
    routePrefix: '/api-docs',
    swaggerOptions: { spec: swaggerSpec },
  })
);

app.use(routes.routes());
app.use(routes.allowedMethods());

module.exports = app;
