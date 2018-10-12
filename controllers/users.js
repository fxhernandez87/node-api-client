// Dependencies
const { formatResponse, hashString, makeRandomString } = require('../lib/helpers');
const { verifyToken } = require('../lib/authentication');
const dataService = require('../services/data');

// instantiating services
const userService = dataService('users');
const tokenService = dataService('tokens');

// regular expression to validate an email
const mailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const postUser = async ({ payload }) => {
  const email = (typeof payload.email === 'string' && payload.email.length > 0 && mailRegex.test(payload.email)) ? payload.email : false;
  const address = (typeof payload.address === 'string' && payload.address.length > 0) ? payload.address : false;
  const password = (typeof payload.password === 'string' && payload.password.length > 0) ? hashString(payload.password) : false;
  const name = (typeof payload.name === 'string' && payload.name.length > 0) ? payload.name : false;
  const tosAgreement = (typeof payload.tosAgreement === 'boolean') ? payload.tosAgreement : false;
  if (email && address && name && password && tosAgreement) {
    try {
      const userData = {email, address, name, password};

      await userService.create(email, userData);
      delete userData.password;

      return formatResponse(200, 'user created', userData);
    } catch (err) {
      switch (err.code) {
        case 'EEXIST':
          return formatResponse(400, 'User already exists');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  } else if (!tosAgreement) {
    return formatResponse(400, 'You must agree term and conditions');
  } else {
    return formatResponse(400, 'Required fields missing or they were invalid');
  }
};

const getUser = async ({ queryStringObject, headers }) => {
  const email = (typeof queryStringObject.email === 'string' && queryStringObject.email.length > 0 && mailRegex.test(queryStringObject.email)) ? queryStringObject.email : false;
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;

  if (email && tokenId) {
    try {
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, email);

      const userData = await userService.read(email);
      delete userData.password;

      return formatResponse(200, 'user fetched correctly', userData);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'User not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(err.statusCode || 400, err.message);
      }
    }
  } else if (!tokenId) {
    return formatResponse(403, 'Unauthorized access');
  } else {
    return formatResponse(400, 'Required fields missing or they were invalid');
  }
};

const updateUser = async ({ payload, queryStringObject, headers }) => {
  const email = (typeof queryStringObject.email === 'string' && typeof payload.email === 'undefined' && queryStringObject.email.length > 0) ? queryStringObject.email : false;
  const address = (typeof payload.address === 'string' && payload.address.length > 0) ? payload.address : false;
  const password = (typeof payload.password === 'string' && payload.password.length > 0) ? hashString(payload.password) : false;
  const name = (typeof payload.name === 'string' && payload.name.length > 0) ? payload.name : false;
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;
  if (email && tokenId && (address || password || name)) {
    try {
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, email);

      const userData = await userService.read(email);
      userData.address = address || userData.address;
      userData.password = password || userData.password;
      userData.name = name || userData.name;

      await userService.update(email, userData);
      delete userData.password;

      return formatResponse(200, 'user updated correctly', userData);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'User not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  } else if (!email && payload.email){
    return formatResponse(421, 'Email cannot be updated');
  } else if (!email) {
    return formatResponse(400, 'Email in query is required');
  } else if (!tokenId) {
    return formatResponse(403, 'Unauthorized access');
  } else {
    return formatResponse(400, 'Nothing to update');
  }
};

const deleteUser = async ({ queryStringObject, headers }) => {
  const email = (typeof queryStringObject.email === 'string' && queryStringObject.email.length > 0 && mailRegex.test(queryStringObject.email)) ? queryStringObject.email : false;
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;
  if (email && tokenId) {
    try {
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, email);

      // list all tokens, and remove all the tokens created by this user
      const tokens = await tokenService.list();
      // read all tokens to know the userEmail
      const tokensData = await Promise.all(tokens.map(token => tokenService.read(token)));
      // remove all tokens from this user one by one
      await Promise.all(tokensData.filter(({userEmail}) => userEmail === email).map(({id}) => tokenService.remove(id)));
      // finally we remove the user
      await userService.remove(email);

      return formatResponse(200, 'user removed correctly', {});
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'User not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  } else if (!tokenId) {
    return formatResponse(403, 'Unauthorized access');
  } else {
    return formatResponse(400, 'Required fields missing or they were invalid');
  }
};

module.exports = {
  post: postUser,
  get: getUser,
  put: updateUser,
  delete: deleteUser,
};
