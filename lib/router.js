// Dependencies
const userController = require('../controllers/users');
const tokenController = require('../controllers/tokens');
const itemController = require('../controllers/items');
const cartController = require('../controllers/cart');

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
  }
];

const controllers = {
  'users': userController,
  'tokens': tokenController,
  'items': itemController,
  'cart': cartController
};

const router = {
  // We 'll define a valid request if the path is one of validRequests paths and if the method is a valid method for that path
  isValidRequest: (path, method) => validRequests.map(req => req.path).includes(path) && validRequests.find(req => req.path === path).methods.includes(method),
  isValidPath: path => validRequests.map(req => req.path).includes(path),
  ...controllers
};

module.exports = router;
