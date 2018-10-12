// Dependencies
const https = require('https');
const queryString = require('querystring');
const config = require('../config');
const { formatResponse, hashString, makeRandomString } = require('../lib/helpers');
const { verifyToken } = require('../lib/authentication');
const dataService = require('../services/data');

// instantiating services
const orderService = dataService('orders');
const userService = dataService('users');
const tokenService = dataService('tokens');
const itemService = dataService('items');

const makeRequest = async (options, postData)  => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let response;
      res.setEncoding('utf-8');
      res.on('data', (chunk) => {
        response = chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(response));
        } catch (err) {
          resolve(response);
        }
      });
    });

    req.on('error', (e) => {
      reject(formatResponse(400, `problem with request: ${e.message}`));
    });

    // write data to request body
    req.write(postData);
    req.end();
  });
};

const postOrder = async ({ headers }) => {
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;
  if (tokenId) {
    try {
      const { userEmail } = await tokenService.read(tokenId);
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, userEmail);
      // get the user data
      const userData = await userService.read(userEmail);
      // check if there are items on the user cart
      const itemList = userData.cartItems instanceof Array && userData.cartItems.length > 0 ? [...userData.cartItems] : false;

      if (itemList) {
        // get all the data from the items
        const fullItemsList = await Promise.all(itemList.map(id => itemService.read(id)));
        // get a random string as id for the new token
        const orderId = makeRandomString(16);
        // get order list from userData
        const orderList = userData.orders instanceof Array && userData.orders.length > 0 ? [...userData.orders] : [];
        // save the order data
        const orderData = {
          id: orderId,
          items: fullItemsList,
          price: fullItemsList.reduce((accumulator, item) => accumulator += item.price, 0),
          iat: Date.now()
        };
        // process payment
        const stripePostData = queryString.stringify({
          currency: 'usd',
          amount: orderData.price * 100, // amount in cents
          description: `charges for this orderId ${orderId}`,
          source: 'tok_visa'
        });
        const stripeOptions = {
          protocol: 'https:',
          hostname: 'api.stripe.com',
          port: 443,
          path: '/v1/charges',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stripePostData),
            'Authorization': 'Bearer '+ config.stripe.secret
          }
        };
        // getting the outcome of the request
        const {outcome: {type}, paid} = await makeRequest(stripeOptions, stripePostData);
        if (type === 'authorized' && paid === true) {
          // save order data
          orderData.paymentProcessed = true;
          await orderService.create(orderId, orderData);

          // notify user
          const mailgunPostData = queryString.stringify({
            from: 'Excited User <me@samples.mailgun.org>',
            to: userEmail,
            subject: 'Receipt for the orderId ' + orderId,
            text: 'Your order has been paid'
          });
          const mailgunOptions = {
            protocol: config.mailgun.apiProtocol,
            hostname: config.mailgun.apiHostName,
            port: 443,
            path: config.mailgun.apiPath,
            method: 'POST',
            auth: 'api:'+ config.mailgun.apiKey,
            retry: 1,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(mailgunPostData),
            }
          };

          await makeRequest(mailgunOptions, mailgunPostData);
          // save user data with the new order and remove items from cartItems
          orderList.push(orderId);
          userData.orders = orderList;
          userData.cartItems = [];
          await userService.update(userEmail, userData);

          // return orderData
          return formatResponse(200, 'order created', orderData);
        } else {
          return formatResponse(400, 'payment not processed');
        }

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
  const orderId = (typeof queryStringObject.id === 'string' && queryStringObject.id.length === 16) ? queryStringObject.id : false;
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;

  if (orderId && tokenId) {
    try {
      const { userEmail } = await tokenService.read(tokenId);
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, userEmail);

      const orderData = await orderService.read(orderId);

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
