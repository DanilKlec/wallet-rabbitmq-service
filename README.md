# Wallet Service

Тестовое задание: сервис кошелька на Node.js с Koa, PostgreSQL, Redis, RabbitMQ и gRPC.

## Что умеет

- Регистрация / логин (JWT)
- Просмотр баланса
- Пополнение, вывод, перевод между пользователями
- История транзакций
- Кеш профиля и баланса в Redis (TTL 60 сек)
- События транзакций через RabbitMQ → AuditLog
- gRPC: GetBalance, GetWalletByUserId

## Структура

```
src/
├── config/         # настройки из .env
├── controllers/    # HTTP-обработчики
├── services/       # бизнес-логика
├── repositories/   # запросы к БД
├── models/         # Sequelize-модели
├── middleware/     # auth, validation, errors, logging
├── cache/          # Redis (профиль + баланс)
├── queues/         # RabbitMQ publish/consume
├── grpc/           # gRPC-сервер
├── db/sync.js      # sequelize.sync() (dev/test)
├── db/seed.js      # демо-пользователи
├── docs/swagger.json
├── validators.js
├── routes.js
├── app.js
└── server.js
```

## База данных

Для ускорения разработки тестового проекта схема БД синхронизируется автоматически через `sequelize.sync()` при старте сервера (см. `src/db/sync.js`).

> **Production:** `sequelize.sync()` в production не рекомендуется. Для боевой среды используйте [Sequelize migrations](https://sequelize.org/docs/v6/other-topics/migrations/) — это даёт контролируемое и откатываемое изменение схемы.

Демо-данные: `SEED_DEMO=true` в `.env` создаёт тестовых пользователей при запуске.

## Запуск (Docker)

```bash
docker-compose up -d --build
```

| Сервис | URL |
|--------|-----|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api-docs |
| Frontend | http://localhost:5173 |
| RabbitMQ UI | http://localhost:15672 (guest/guest) |

Демо-аккаунты (создаются при `SEED_DEMO=true`):

- `alice@example.com` / `password123`
- `bob@example.com` / `password123`

## Локальный запуск

PostgreSQL в Docker проброшен на порт **5433** (не 5432), чтобы не конфликтовать с локально установленным PostgreSQL на Windows.

```bash
# инфраструктура
docker-compose up -d postgres redis rabbitmq

# backend
cp .env.example .env
npm install
npm run dev

# frontend (другой терминал)
cd frontend && npm install && npm run dev
```

## API

```
POST /auth/register
POST /auth/login
GET  /auth/profile      (JWT)

GET  /wallet            (JWT)

GET  /transactions      (JWT, ?page&limit&type&sort)
POST /transactions/deposit
POST /transactions/withdraw
POST /transactions/transfer

GET  /health
```

Ответы: `{ "success": true, "data": {} }` или `{ "success": false, "message": "..." }`

## gRPC

```bash
grpcurl -plaintext -d '{"user_id":"<UUID>"}' \
  localhost:50051 wallet.WalletInfoService/GetBalance
```

## Стек

Node.js, Koa, Sequelize, PostgreSQL, Redis, RabbitMQ, gRPC, JWT, bcrypt, decimal.js, Joi, React, Vite, Tailwind, Axios, Docker
