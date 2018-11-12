// Dependencies
const userController = require('../controllers/users');
const tokenController = require('../controllers/tokens');
const itemController = require('../controllers/items');
const cartController = require('../controllers/cart');
const orderController = require('../controllers/orders');
const indexRenderer = require('../renderers/indexRenderer');
const faviconRenderer = require('../renderers/faviconRenderer');
const publicRenderer = require('../renderers/publicRenderer');
const sessionRenderer = require('../renderers/sessionRenderer');
const dashboardRenderer = require('../renderers/dashboardRenderer');
const cartItemRenderer = require('../renderers/cartItemRenderer');
const orderItemRenderer = require('../renderers/orderItemRenderer');

const validRequests = [
  {
    path: 'api/users',
    methods: ['get', 'post', 'put', 'delete']
  },
  {
    path: 'api/tokens',
    methods: ['get', 'post', 'put', 'delete', 'options']
  },
  {
    path: 'api/items',
    methods: ['get', 'post', 'put', 'delete']
  },
  {
    path: 'api/cart',
    methods: ['get', 'post', 'delete']
  },
  {
    path: 'api/orders',
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
    path: 'loggedout',
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
    path: 'cart/items',
    methods: ['get']
  },
  {
    path: 'account/edit',
    methods: ['get']
  },
  {
    path: 'orders',
    methods: ['get']
  },
  {
    path: 'order/items',
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
  'login': sessionRenderer,
  'loggedout': sessionRenderer,
  'signup': sessionRenderer,
  'items/available': dashboardRenderer,
  'orders': sessionRenderer,
  'cart/items': cartItemRenderer,
  'order/items': orderItemRenderer,
  'account/edit': sessionRenderer,
  // 'items-available': cartController,
  // 'place-order': orderController
};

const router = {
  // We 'll define a valid request if the path is one of validRequests paths and if the method is a valid method for that path
  isValidRequest: (path, method) => {
    return (path.includes('public/') && method === 'get') ||
      validRequests.map(req => req.path).includes(path) && validRequests.find(req => req.path === path).methods.includes(method)
  },
  isValidPath: path => validRequests.map(req => req.path).includes(path) || path.includes('public'),
  isPublicRequest: (path, method) => path.includes('public') && method === 'get',
  ...backEndControllers,
  ...frontEndControllers
};

module.exports = router;
