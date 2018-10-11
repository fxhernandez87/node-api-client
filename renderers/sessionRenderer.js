// Dependencies
const { formatResponse, getTemplate, addUniversalTemplates } = require('../lib/helpers');


const getIndex = async (data) => {
  // Prepare data for interpolation
  const templateData = {
    'head.title' : 'Delivery Application',
    'head.description' : 'Orders and payments made easy',
    'body.class' : 'index'
  };
  try {
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
