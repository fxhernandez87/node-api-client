// Dependencies
const { formatResponse, makeRandomString } = require('../lib/helpers');
const dataService = require('../services/data');

// instantiating service
const itemService = dataService('items');

/**
 * Required Fields: email and password
 */
const postItem = async ({ payload }) => {
  console.log(typeof payload.price);
  const name = (typeof payload.name === 'string' && payload.name.length > 0) ? payload.name : false;
  const price = (typeof payload.price === 'number' && payload.price > 0) ? payload.price : false;
  if (name && price) {
    try {
      // get a random string as id for the new item
      const itemId = makeRandomString(16);

      const itemData = {id: itemId, name, price};

      await itemService.create(itemId, itemData);

      return formatResponse(200, 'item created', itemData);
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

const getItem = async ({ queryStringObject }) => {
  const id = (typeof queryStringObject.id === 'string' && queryStringObject.id.length === 16) ? queryStringObject.id : false;
  if (id) {
    try {
      const itemData = await itemService.read(id);

      return formatResponse(200, 'item fetched correctly', itemData);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'Item not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          return formatResponse(500, 'Database if corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  } else {
    // return a list of items instead
    try {
      const itemIds = await itemService.list();

      const itemData = await Promise.all(itemIds.map(itemId => itemService.read(itemId)));

      const name = (typeof queryStringObject.name === 'string' && queryStringObject.name.length > 0) ? queryStringObject.name : false;
      const price = (typeof queryStringObject.price === 'string' && queryStringObject.price > 0) ? parseFloat(queryStringObject.price) : false;

      return formatResponse(200, 'items fetched correctly', itemData.filter(item => {
        return name
          ? price
            ? item.name === name && item.price === price
            : item.name === name
          : price
            ?  item.price === price
            : true
      }));
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'Item not found');
        case 'EACCES':
          return formatResponse(500, 'Insufficient Permissions');
        case 'ENOTDIR':
          return formatResponse(500, 'Database is corrupted');
        default:
          return formatResponse(400, err.message);
      }
    }
  }
};

const updateItem = async ({ payload, queryStringObject }) => {
  const id = (typeof queryStringObject.id === 'string' && typeof payload.id === 'undefined' && queryStringObject.id.length === 16) ? queryStringObject.id : false;
  const price = (typeof payload.price === 'number' && payload.price.length > 0) ? payload.price : false;
  const name = (typeof payload.name === 'string' && payload.name.length > 0) ? payload.name : false;
  if (id && (price || name)) {
    try {
      const itemData = await itemService.read(id);
      itemData.price = price || itemData.price;
      itemData.name = name || itemData.name;

      await itemService.update(id, itemData);

      return formatResponse(200, 'item updated correctly', itemData);
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'Item not found');
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

const deleteItem = async ({ queryStringObject }) => {
  const id = (typeof queryStringObject.id === 'string' && queryStringObject.id.length === 16) ? queryStringObject.id : false;
  if (id) {
    try {
      await itemService.remove(id);

      return formatResponse(200, 'item removed correctly', {});
    } catch (err) {
      switch (err.code) {
        case 'ENOENT':
          return formatResponse(404, 'Item not found');
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
  post: postItem,
  get: getItem,
  put: updateItem,
  delete: deleteItem,
};
