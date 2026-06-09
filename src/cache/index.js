const Redis = require('ioredis');
const config = require('../config');

let redis;

function getRedis() {
  if (!redis) {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      lazyConnect: true,
    });
  }
  return redis;
}

async function connect() {
  await getRedis().connect();
}

async function disconnect() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

async function getProfile(userId) {
  const data = await getRedis().get(`profile:${userId}`);
  return data ? JSON.parse(data) : null;
}

async function setProfile(userId, profile) {
  await getRedis().setex(`profile:${userId}`, config.redis.ttl, JSON.stringify(profile));
}

async function getBalance(userId) {
  return getRedis().get(`balance:${userId}`);
}

async function setBalance(userId, balance) {
  await getRedis().setex(`balance:${userId}`, config.redis.ttl, balance);
}

async function invalidateBalance(userId) {
  await getRedis().del(`balance:${userId}`);
}

async function invalidateBalances(userIds) {
  if (!userIds.length) return;
  const keys = userIds.map((id) => `balance:${id}`);
  await getRedis().del(...keys);
}

module.exports = {
  connect,
  disconnect,
  getRedis,
  getProfile,
  setProfile,
  getBalance,
  setBalance,
  invalidateBalance,
  invalidateBalances,
};
