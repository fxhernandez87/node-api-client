// Dependencies
const { formatResponse, getTemplate } = require('../lib/helpers');
const dataService = require('../services/data');
// instantiating service
const orderService = dataService('orders');

const getOrders = async (data) => {
  // Prepare data for interpolation
  const templateData = {
    'body.orders': '',
    'body.totalPrice': '',
  };
  let totalPrice = 0;
  try {
    const { orders } = data.queryStringObject;
    const orderIds = orders.split(',');
    if (orderIds && Array.isArray(orderIds) && orderIds.length) {
      const ordersData = await Promise.all(orderIds.map(async order => {
        return orderService.read(order);
      }));

      const tempData = ordersData.map(({items, ...orderData}) => {
        return {
          ...orderData,
            items: items.reduce((acum, item) => {
              if (acum[item.id]) {
                acum[item.id].qty += 1;
              } else {
                acum[item.id] = {...item};
                acum[item.id].qty = 1;
              }
              return acum;
            }, {})
          };
        });

      const ordersRender = await Promise.all(
          tempData.map(async order => {
            const { id, price, items, iat, paymentProcessed} = order;
            const orderContent = Object.values(items).map(({name, qty}) => `${name} x${qty}`).join('<br />');
            const orderRender = {
                'order.id': id,
                'order.price': price,
                'order.items': orderContent,
                'order.date': new Date(iat).toDateString(),
                'order.processed': paymentProcessed ? 'Payment processed' : 'Payment pending',
                'order.content': '',
            };
            orderRender['order.content'] = await getTemplate('order-item-content', orderRender);;
            totalPrice += price;
          // Read in order template as a string
          return getTemplate('order-items', orderRender);
        })
      );
      templateData['body.orders'] = ordersRender.join('');
    }

    return formatResponse(200, '', {str: templateData['body.orders']}, 'application/json');

  } catch (err) {
    return formatResponse(500, '', 'error', 'text/html');
  }
};

module.exports = {
  get: getOrders
};
