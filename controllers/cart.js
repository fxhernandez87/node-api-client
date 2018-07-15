// Dependencies
const { formatResponse, hashString, makeRandomString } = require('../lib/helpers');
const { verifyToken } = require('../lib/authentication');
const dataService = require('../services/data');

// instantiating services
const userService = dataService('users');
const tokenService = dataService('tokens');
const itemService = dataService('items');

// regular expression to validate an email
const mailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const addItemToCart = async ({ payload, headers }) => {
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;
  const itemId = (typeof payload.itemId === 'string' && payload.itemId.length === 16) ? payload.itemId : false;
  if (itemId && tokenId) {
    try {
      const {userEmail} = await tokenService.read(tokenId);
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, userEmail);

      // verify if the item exists
      try {
        await itemService.read(itemId);
      } catch (err){
        switch (err.code) {
          case 'ENOENT':
            return formatResponse(404, 'item not found');
          default:
            return formatResponse(400, err.message);
        }
      }
      // get the user data
      const userData = await userService.read(userEmail);
      // check if there are items on the user cart
      const itemList = userData.cartItems instanceof Array && userData.cartItems.length > 0 ? [...userData.cartItems] : [];
      // add the item
      itemList.push(itemId);
      // save the user with the new data
      const newUserData = {...userData, cartItems: itemList, lastItemAddedAt: Date.now()};
      await userService.update(userEmail, newUserData);
      // remove the password to send the response
      delete newUserData.password;

      return formatResponse(200, 'item added to cart', newUserData);
    } catch (err) {
      switch (err.code) {
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

const getCart = async ({ headers }) => {
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;

  if (tokenId) {
    try {
      const {userEmail} = await tokenService.read(tokenId);
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, userEmail);
      // get the user data
      const userData = await userService.read(userEmail);

      const cartItems = userData.cartItems instanceof Array && userData.cartItems.length > 0 ? [...userData.cartItems] : [];

      // retrieve all the data from the items in cart
      const itemList = await Promise.all(cartItems.map(itemId => itemService.read(itemId)));

      return formatResponse(200, 'cart fetched correctly', itemList);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'items not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(err.statusCode || 400, err.message);
      }
    }
  } else {
    return formatResponse(403, 'Unauthorized access');
  }
};

const removeItemFromCart = async ({ payload, headers }) => {
  const itemId = (typeof payload.itemId === 'string' && payload.itemId.length === 16) ? payload.itemId : false;
  const tokenId = (typeof headers.tokenid === 'string' && headers.tokenid.length === 16) ? headers.tokenid : false;
  if (itemId && tokenId) {
    try {
      const {userEmail} = await tokenService.read(tokenId);
      // if the token is not verified, it will throw a custom error
      await verifyToken(tokenId, userEmail);

      // get the user data
      const userData = await userService.read(userEmail);
      // check if there are items on the user cart
      const itemList = userData.cartItems instanceof Array && userData.cartItems.length > 0 ? [...userData.cartItems] : [];
      // get the index of the itemId
      const itemIndex = itemList.indexOf(itemId);
      if (itemIndex > -1) {
        // remove the item
        itemList.splice(itemIndex, 1);
        // save the user with the new data
        const newUserData = {...userData, cartItems: itemList, lastItemAddedAt: Date.now()};
        await userService.update(userEmail, newUserData);
        // remove the password to send the response
        delete newUserData.password;

        return formatResponse(200, 'item removed from cart', newUserData);
      } else {
        return formatResponse(404, 'item not found on cart');
      }
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
  post: addItemToCart,
  get: getCart,
  delete: removeItemFromCart,
};
