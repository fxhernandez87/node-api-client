// Dependencies
const { formatResponse, getStaticAsset} = require('../lib/helpers');


const getPublic = async (payload) => {
  console.log(payload);
  // Prepare data for interpolation
  // const templateData = {
  //   'head.title' : 'Delivery Application',
  //   'head.description' : 'Orders and payments made easy',
  //   'body.class' : 'index'
  // };
  try {
    // Read in a template as a string
    // Read in a template as a string
    const favicon = await getStaticAsset('favicon.ico');

    return formatResponse(200, '', favicon, 'image/x-icon');

  } catch (err) {
    return formatResponse(500, '', 'error', 'text/html');
  }
};

module.exports = {
  get: getPublic
};
