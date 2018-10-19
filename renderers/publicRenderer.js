// Dependencies
const { formatResponse, getStaticAsset} = require('../lib/helpers');


const getPublic = async (payload) => {
  try {
    // Get the filename being requested

    const trimmedAssetName = payload.path.replace('public/','').trim();
    // Getting the static asset
    const asset = await getStaticAsset(trimmedAssetName);

    // get the content type
    switch (true) {
      case trimmedAssetName.indexOf('.css') > -1:
        return formatResponse(200, '', asset, 'text/css');
      case trimmedAssetName.indexOf('.png') > -1:
        return formatResponse(200, '', asset, 'image/png');
      case trimmedAssetName.indexOf('.jpg') > -1:
        return formatResponse(200, '', asset, 'image/jpeg');
      case trimmedAssetName.indexOf('.ico') > -1:
        return formatResponse(200, '', asset, 'image/x-icon');
      case trimmedAssetName.indexOf('.html') > -1:
        return formatResponse(200, '', asset, 'text/html');
      default:
        return formatResponse(200, '', asset, 'text/plain');
    }
  } catch (err) {
    return formatResponse(500, err.message, 'error', 'text/html');
  }
};

module.exports = {
  get: getPublic
};
