const config = {};

if (process.env.NODE_ENV === 'production') {
  config.httpPort = 5000;
  config.httpsPort = 5001;
  config.hashSecret = 'fxh';
} else {
  config.httpPort = 3002;
  config.httpsPort = 3001;
  config.hashSecret = 'fxh';
  config.stripe = {
    publishable: 'pk_test_vwDivBwPeLHL3jtOd8D6rPCu',
    secret: 'sk_test_ZC817xZyVcVXjNIOjnfjrzLC'
  };
  config.mailgun = {
    apiHostName: 'api.mailgun.net',
    apiProtocol: 'https:',
    apiPath: '/v3/sandboxf4057411f5d24c86a990185d1d964e90.mailgun.org/messages',
    apiKey: 'key-fed165a146b68f88d307560f11d8bfd2',
    defaultPassword: '9c9769e5ae01f99561991e252e99d1d5-21e977f8-a0cef03b'
  };
  config.templateGlobals = {
    appName : 'Delivery APP',
    companyName : 'NotARealCompany, Inc.',
    yearCreated : '2018',
    baseUrl : 'http://localhost:3002/'
  }
}

module.exports = config;

