const crypto = require('crypto');
const config = require('../config');

const formatResponse = (statusCode, message, data = {}) => {
  return {statusCode, message, data};
};

const makeRandomString = strLength => {
  strLength = typeof strLength === 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    const possibleChars = 'abcdef0123456789';

    let randomString = '';

    for (let i = 0; i < strLength; i++) {
      randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
    }

    return randomString;
  } else {
    return false;
  }
};

const hashString = str => {
  if (typeof str === 'string' && str.length > 0) {
    return crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex');
  } else {
    return false;
  }
};

module.exports = {
  formatResponse,
  makeRandomString,
  hashString,
};
