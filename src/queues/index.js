const amqp = require('amqplib');
const config = require('../config');
const logger = require('../utils/logger');
const { AuditLog } = require('../models');

const EXCHANGE = config.rabbitmq.exchange;
const QUEUE = config.rabbitmq.queue;
const ROUTING_KEY = 'transaction.created';

let connection;
let channel;

async function getChannel() {
  if (channel) return channel;

  connection = await amqp.connect(config.rabbitmq.url);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  return channel;
}

async function publishTransactionCreated(payload) {
  try {
    const ch = await getChannel();
    ch.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
    });
    logger.info(`Published ${ROUTING_KEY}`, { transactionId: payload.transactionId });
  } catch (err) {
    logger.error(err);
  }
}

async function startConsumer() {
  const ch = await getChannel();

  await ch.assertQueue(QUEUE, { durable: true });
  await ch.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

  ch.consume(QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      logger.info(`Received ${ROUTING_KEY}`, { transactionId: payload.transactionId });

      await AuditLog.create({
        eventType: ROUTING_KEY,
        payload,
      });

      ch.ack(msg);
    } catch (err) {
      logger.error(err);
      ch.nack(msg, false, false);
    }
  });

  logger.info('RabbitMQ consumer started');
}

async function close() {
  if (channel) await channel.close();
  if (connection) await connection.close();
  channel = null;
  connection = null;
}

module.exports = {
  publishTransactionCreated,
  startConsumer,
  close,
};
