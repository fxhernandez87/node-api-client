// Dependencies
const { formatResponse, getTemplate } = require('../lib/helpers');
const dataService = require('../services/data');
// instantiating service
const itemService = dataService('items');

const getCartItem = async (data) => {
  // Prepare data for interpolation
  const templateData = {
    'body.cartItems': '',
    'body.totalPrice': '',
  };
  let totalPrice = 0;
  try {
    const { items } = data.queryStringObject;
    const cartItems = items.split(',');
    if (cartItems && Array.isArray(cartItems) && cartItems.length) {
      const tempData = cartItems.reduce((acum, item) => {
        if (acum[item]) {
          acum[item].qty += 1;
        } else {
          acum[item] = {item};
          acum[item].qty = 1;
        }
        return acum;
      }, {});

      const itemsData = await Promise.all(Object.values(tempData).map(async ({item, qty}) => {
        const itemData = await itemService.read(item);
        return {...itemData, qty};
      }));

      const itemsRender = await Promise.all(
        Object.values(itemsData).map(async ({id, name, description, price, image, qty}) => {
          const itemRender = {
            'cartItem.id': id,
            'cartItem.name': name,
            'cartItem.description': description || '',
            'cartItem.price': price,
            'cartItem.image': image || 'public/images/empty.jpg',
            'cartItem.qty': parseInt(qty) || 0
          };
            totalPrice += price*parseInt(qty);
          // Read in item template as a string
          return getTemplate('cart-items', itemRender);
        })
      );
      templateData['body.cartItems'] = itemsRender.join('');
      templateData['body.totalPrice'] = totalPrice;
    }
    const str = await getTemplate('shopping-cart', templateData);

    return formatResponse(200, '', {str}, 'application/json');

  } catch (err) {
    return formatResponse(500, '', 'error', 'text/html');
  }
};

module.exports = {
  get: getCartItem
};
