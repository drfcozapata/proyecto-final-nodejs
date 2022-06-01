const express = require('express');

// Middlewares
const { protectToken } = require('../middlewares/users.middlewares');
const {
  cartExists,
  productExistsInCart,
  enoughProductStock,
} = require('../middlewares/orders.middlewares');

// Controllers
const { checkToken } = require('../controllers/users.controller');
const {
  addProductToCart,
  updateCartInCart,
  deleteProductFromCart,
  purchaseCart,
} = require('../controllers/orders.controller');

const router = express.Router();

// Apply protectToken middleware and checkToken controller
router.use(protectToken);
router.get('/check-token', checkToken);

// Routes
router.post('/add-product', enoughProductStock, addProductToCart);
router.patch(
  '/update-cart',
  cartExists,
  productExistsInCart,
  enoughProductStock,
  updateCartInCart
);
router.post('/purchase', cartExists, purchaseCart);
router.delete(
  '/:productId',
  cartExists,
  productExistsInCart,
  deleteProductFromCart
);

module.exports = { cartRouter: router };
