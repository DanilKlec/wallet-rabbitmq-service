const Decimal = require('decimal.js');

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

function toDecimal(value) {
  return new Decimal(value || 0);
}

function formatDecimal(value) {
  return toDecimal(value).toFixed(8);
}

function isPositive(value) {
  return toDecimal(value).greaterThan(0);
}

module.exports = {
  toDecimal,
  formatDecimal,
  isPositive,
};
