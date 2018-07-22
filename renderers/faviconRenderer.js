// Dependencies
const { formatResponse, getStaticAsset } = require('../lib/helpers');


const getFavicon = async () => {
  try {
    // Read in a template as a string
    const favicon = await getStaticAsset('favicon.ico');

    return formatResponse(200, '', favicon, 'image/x-icon');
  } catch (err) {
    return formatResponse(500, '', {});
  }
};

module.exports = {
  get: getFavicon
};
