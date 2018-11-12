// Dependencies
const { formatResponse, getTemplate, addUniversalTemplates } = require('../lib/helpers');
const dataService = require('../services/data');
// instantiating service
const itemService = dataService('items');

const getIndex = async (data) => {
  // Prepare data for interpolation
  const templateData = {
    'head.title' : 'Delivery Application',
    'head.description' : 'Orders and payments made easy',
    'body.class': data.path.replace('/', '-'),
    'body.items': '',
  };
  try {
    const items = await itemService.list();
    if (items && Array.isArray(items) && items.length) {
      const itemsData = await Promise.all(
        items.map(async item => {
          // Read in item template as a string
          return itemService.read(item);
        })
      );

      const itemsRender = await Promise.all(
        itemsData.map(async ({id, name, description, price, image, bought}) => {
          const itemRender = {
            'item.id': id,
            'item.name': name,
            'item.description': description || '',
            'item.price': price,
            'item.image': image || 'public/images/empty.jpg',
            'item.bought': parseInt(bought) || 0
          };
          // Read in item template as a string
          return getTemplate('item', itemRender);
        })
      );
      templateData['body.items'] = itemsRender.join('');
    }
    // Read in a template as a string
    const str = await getTemplate(data.path.replace('/', '-'), templateData);
    // Add the universal header and footer
    const html = await addUniversalTemplates(str, templateData);

    return formatResponse(200, '', html, 'text/html');
  } catch (err) {
    return formatResponse(500, '', 'error', 'text/html');
  }
};

module.exports = {
  get: getIndex
};
