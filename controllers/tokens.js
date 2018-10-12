// Dependencies
const { formatResponse, hashString, makeRandomString } = require('../lib/helpers');
const dataService = require('../services/data');

// instantiating service
const tokenService = dataService('tokens');
const userService = dataService('users');

// regular expression to validate an email
const mailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Required Fields: email and password
 */
const postToken = async ({ payload }) => {
  const requestEmail = (typeof payload.email === 'string' && payload.email.length > 0) ? payload.email : false;
  const requestPassword = (typeof payload.password === 'string' && payload.password.length > 0) ? hashString(payload.password) : false;
  if (requestEmail && requestPassword) {
    try {
      const {email, password} = await userService.read(requestEmail);
      if (email === requestEmail && password === requestPassword) {
        // get a random string as id for the new token
        const tokenId = makeRandomString(16);

        const tokenData = {id: tokenId, userEmail: email, expires: Date.now() + 1000 * 60 * 60 * 24};

        await tokenService.create(tokenId, tokenData);

        return formatResponse(200, 'user logged in', tokenData);
      } else {
        return formatResponse(400, 'wrong email or password');
      }
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'User does not exists');
        case 'EEXIST':
          return formatResponse(400, 'Token already exists');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  } else {
    return formatResponse(400, 'Required fields missing or they were invalid');
  }
};

const getToken = async ({ queryStringObject }) => {
  const id = (typeof queryStringObject.id === 'string' && queryStringObject.id.length === 16) ? queryStringObject.id : false;
  if (id) {
    try {
      const tokenData = await tokenService.read(id);

      return formatResponse(200, 'token fetched correctly', tokenData);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'Token not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  } else {
    return formatResponse(400, 'Required fields missing or they were invalid');
  }
};

const updateToken = async ({ payload, queryStringObject }) => {
  const id = (typeof queryStringObject.id === 'string' && typeof payload.id === 'undefined' && queryStringObject.id.length === 16) ? queryStringObject.id : false;
  const expires = (typeof payload.expires === 'number') ? payload.expires : false;
  const userEmail = (typeof payload.userEmail === 'string' && payload.userEmail.length > 0 && mailRegex.test(payload.userEmail.email)) ? payload.userEmail : false;
  if (id && (expires || userEmail)) {
    try {
      const tokenData = await tokenService.read(id);
      tokenData.expires = expires || tokenData.expires;
      tokenData.userEmail = userEmail || tokenData.userEmail;

      await tokenService.update(id, tokenData);

      return formatResponse(200, 'token updated correctly', tokenData);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'Token not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  } else if (!id && payload.id){
    return formatResponse(421, 'id cannot be updated');
  } else if (!id) {
    return formatResponse(400, 'id in query is required');
  } else {
    return formatResponse(400, 'Nothing to update');
  }
};

const deleteToken = async ({ queryStringObject }) => {
  const id = (typeof queryStringObject.id === 'string' && queryStringObject.id.length === 16) ? queryStringObject.id : false;
  if (id) {
    try {
      await tokenService.remove(id);

      return formatResponse(200, 'token removed correctly', {});
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'Token not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  } else {
    return formatResponse(400, 'Required fields missing or they were invalid');
  }
};

module.exports = {
  post: postToken,
  get: getToken,
  put: updateToken,
  delete: deleteToken,
  options: () => formatResponse(200, 'request valid'),
};
