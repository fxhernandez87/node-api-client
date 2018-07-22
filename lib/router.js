// Dependencies
const userController = require('../controllers/users');
const tokenController = require('../controllers/tokens');
const itemController = require('../controllers/items');
const cartController = require('../controllers/cart');
const orderController = require('../controllers/orders');
const indexRenderer = require('../renderers/indexRenderer');
const faviconRenderer = require('../renderers/faviconRenderer');
const publicRenderer = require('../renderers/publicRenderer');

const validRequests = [
  {
    path: 'users',
    methods: ['get', 'post', 'put', 'delete']
  },
  {
    path: 'tokens',
    methods: ['get', 'post', 'put', 'delete']
  },
  {
    path: 'items',
    methods: ['get', 'post', 'put', 'delete']
  },
  {
    path: 'cart',
    methods: ['get', 'post', 'delete']
  },
  {
    path: 'orders',
    methods: ['get', 'post']
  },
  {
    path: '',
    methods: ['get']
  },
  {
    path: 'favicon.ico',
    methods: ['get']
  },
  {
    path: 'public/',
    methods: ['get']
  },
  {
    path: 'login',
    methods: ['get']
  },
  {
    path: 'signup',
    methods: ['get']
  },
  {
    path: 'items/available',
    methods: ['get']
  },
  {
    path: 'place/order',
    methods: ['get']
  },
];

const backEndControllers = {
  'api/users': userController,
  'api/tokens': tokenController,
  'api/items': itemController,
  'api/cart': cartController,
  'api/orders': orderController
};

const frontEndControllers = {
  '': indexRenderer,
  'favicon.ico': faviconRenderer,
  'public/*': publicRenderer,
  // 'login': tokenController,
  // 'signup': itemController,
  // 'items-available': cartController,
  // 'place-order': orderController
};

const router = {
  // We 'll define a valid request if the path is one of validRequests paths and if the method is a valid method for that path
  isValidRequest: (path, method) => validRequests.map(req => req.path).includes(path) && validRequests.find(req => req.path === path).methods.includes(method),
  isValidPath: path => validRequests.map(req => req.path).includes(path),
  ...backEndControllers,
  ...frontEndControllers
};

module.exports = router;
