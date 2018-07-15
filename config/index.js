const config = {};

if (process.env.NODE_ENV === 'production') {
  config.httpPort = 5000;
  config.httpsPort = 5001;
  config.hashSecret = 'fxh';
} else {
  config.httpPort = 3000;
  config.httpsPort = 3001;
  config.hashSecret = 'fxh';
  config.stripe = {
    publishable: 'pk_test_vwDivBwPeLHL3jtOd8D6rPCu',
    secret: 'sk_test_ZC817xZyVcVXjNIOjnfjrzLC'
  }
}

module.exports = config;

