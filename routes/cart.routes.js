const express = require('express');

// Middlewares
const { protectToken } = require('../middlewares/users.middlewares');

// Controllers
const {
  getUserCart,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  purchaseCart,
} = require('../controllers/orders.controller');

const router = express.Router();

// Apply protectToken middleware and checkToken controller
router.use(protectToken);

// Routes
router.get('/', getUserCart);
router.post('/add-product', addProductToCart);
router.patch('/update-cart', updateProductInCart);
router.post('/purchase', purchaseCart);
router.delete('/:productId', deleteProductFromCart);

module.exports = { cartRouter: router };
