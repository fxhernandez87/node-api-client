// Dependencies
const { formatResponse } = require('../lib/helpers');
const dataService = require('../services/data');

// instantiating services
const tokenService = dataService('tokens');

const verifyToken = async (tokenId, email) => {
  const id = (typeof tokenId === 'string' && tokenId.length === 16) ? tokenId: false;
  const userEmail = (typeof email === 'string' && email.length > 0) ? email: false;
  if (id && userEmail) {
    try {
      const tokenData = await tokenService.read(id);
      if (tokenData.userEmail === userEmail && tokenData.expires > Date.now()) {
        return true
      } else if (tokenData.userEmail !== userEmail) {
        throw formatResponse(403, 'Unauthorized access');
      } else {
        throw formatResponse(403, 'Token has expired');
      }
    } catch (err) {
      console.log(err);
      switch (err.code) {
        case 'ENOENT':
          throw formatResponse(403, 'invalid token id');
        case 'EACCES':
          throw formatResponse(500, 'Insufficient Permissions');
        case 'EISDIR':
          throw formatResponse(500, 'Database if corrupted');
        default:
          throw formatResponse(err.statusCode || 400, err.message);
      }
    }
  } else {
    throw new Error('Unauthorized access', 403);
  }

};

module.exports = {
  verifyToken
};
