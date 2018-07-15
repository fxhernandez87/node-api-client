// Dependencies
const http = require('http');
const url = require('url');
const config = require('./config');
const router = require('./lib/router');
const StringDecoder = require('string_decoder').StringDecoder;

const decoder = new StringDecoder('utf-8');

// start the http server
const server = http.createServer((req, res) => {
  const start = process.hrtime();
  // Get the parsedUrl from the request URL
  const { pathname, query: queryStringObject } = url.parse(req.url, true);

  const path = pathname.replace(/^\/+|\/+$/g, '');

  const method = req.method.toLowerCase();

  const headers = req.headers;

  let buffer = '';

  req.on('data', data => {
    buffer += decoder.write(data);
  });

  req.on('end', async () => {
    buffer += decoder.end();

    const isValidRequest = router.isValidRequest(path, method);

    const controller = isValidRequest ? router[path] : false;

    const data = {
      headers,
      method,
      queryStringObject,
      payload: buffer ? JSON.parse(buffer) : {}
    };

    const response = controller ? await controller[method](data) : {
      statusCode: router.isValidPath(path) ? 405 : 400,
        message: router.isValidPath(path) ? 'Method not allowed' : 'Invalid Path',
    };
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(response.statusCode);
    console.log(method.toUpperCase(), path, response.statusCode, `${process.hrtime(start)[1] / 100000} ms`);
    res.end(JSON.stringify(response));
  })
});


server.listen(config.httpPort, () => {
  console.log(`server is listening to port ${config.httpPort}`);
});
