const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const config = require('../config');

const readFile = promisify(fs.readFile);

const formatResponse = (statusCode, message, data = {}, contentType = 'application/json') => {
  return {statusCode, message, data, contentType};
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

// Get the string content of a template, and use provided data for string interpolation
const getTemplate = async (templateName, data) => {
  templateName = typeof(templateName) === 'string' && templateName.length > 0 ? templateName : false;
  data = typeof(data) === 'object' && data !== null ? data : {};
  if(templateName) {
    const templatesDir = path.join(__dirname, '/../templates/');
    const str = await readFile(templatesDir + templateName + '.html', 'utf8');
    // Do interpolation on the string
    return interpolate(str, data);
  }
  return false;
};

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
const addUniversalTemplates = async (str, data) => {
  str = typeof(str) === 'string' && str.length > 0 ? str : '';
  data = typeof(data) === 'object' && data !== null ? data : {};
  // Get the header
  const headerString = await getTemplate('_header', data);
  const footerString = await getTemplate('_footer', data);
  return headerString+str+footerString;
};

// Take a given string and data object, and find/replace all the keys within it
const interpolate = (str, data) => {
  str = typeof(str) === 'string' && str.length > 0 ? str : '';
  data = typeof(data) === 'object' && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for(let keyName in config.templateGlobals){
    if(config.templateGlobals.hasOwnProperty(keyName)){
      data['global.'+keyName] = config.templateGlobals[keyName]
    }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for(let key in data){
    if(data.hasOwnProperty(key) && typeof(data[key] === 'string')){
      const replace = data[key];
      const find = '{'+key+'}';
      str = str.replace(find,replace);
    }
  }
  return str;
};

// Get the contents of a static (public) asset
const getStaticAsset = async fileName => {
  fileName = typeof(fileName) === 'string' && fileName.length > 0 ? fileName : false;
  if(fileName) {
    const publicDir = path.join(__dirname, '/../public/');
    return readFile(publicDir + fileName);
  }
  return false;
};

module.exports = {
  formatResponse,
  makeRandomString,
  hashString,
  getStaticAsset,
  addUniversalTemplates,
  getTemplate,
  interpolate
};
