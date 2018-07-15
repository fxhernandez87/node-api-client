// Dependencies
const { formatResponse, hashString, makeRandomString } = require('../lib/helpers');
const { verifyToken } = require('../lib/authentication');
const dataService = require('../services/data');

// instantiating services
const orderService = dataService('orders');
const tokenService = dataService('tokens');

// regular expression to validate an email
const mailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const postOrder = async ({ headers }) => {
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;
  if (tokenId) {
    try {
      const {userEmail} = await tokenService.read(tokenId);
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, userEmail);
      // check if there are items on the user cart
      const itemList = userData.cartItems instanceof Array && userData.cartItems.length > 0 ? [...userData.cartItems] : false;

      if (itemList) {
        // get a random string as id for the new token
        const orderId = makeRandomString(16);
        // save the order data

        // process payment

        // notify user

        // save user data with the new order and remove items from cartItems

        // return orderData
        return formatResponse(200, 'order created', orderData);
      } else {
        return formatResponse(400, 'no items on cart to place an order');
      }

    } catch (err) {
      switch (err.code) {
        case 'EEXIST':
          return formatResponse(400, 'Order already exists');
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

const getOrder = async ({ queryStringObject, headers }) => {
  const email = (typeof queryStringObject.email === 'string' && queryStringObject.email.length > 0 && mailRegex.test(queryStringObject.email)) ? queryStringObject.email : false;
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;

  if (email && tokenId) {
    try {
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, email);

      const orderData = await orderService.read(email);
      delete orderData.password;

      return formatResponse(200, 'order fetched correctly', orderData);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'Order not found');
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

module.exports = {
  post: postOrder,
  get: getOrder,
};
