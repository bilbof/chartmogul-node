'use strict';

var chartmogul = require('./chartmogul');

module.exports = function (token, key) {
  return new chartmogul({
    token: token,
    key: key
  });
};