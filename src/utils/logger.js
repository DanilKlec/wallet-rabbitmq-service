const logger = {
  info(message, meta) {
    const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`[${new Date().toISOString()}] INFO: ${message}${suffix}`);
  },

  request(method, url, durationMs) {
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${durationMs}ms`);
  },

  error(err) {
    console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
    if (err.stack) console.error(err.stack);
  },
};

module.exports = logger;
