// Models
const { Cart } = require('../models/cart.model');
const { ProductsInCart } = require('../models/productsInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { Product } = require('../models/product.model');

const cartExists = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  const cart = await Cart.findOne({
    where: { id, userId: sessionUser.id, status: 'active' },
  });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  req.cart = cart;
  next();
});

const productExistsInCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { cart } = req;

  const productInCart = await ProductsInCart.findOne({
    where: { cartId: cart.id, productId, status: 'active' },
  });

  if (!productInCart) {
    return next(new AppError('Product not found in cart', 404));
  }

  req.productInCart = productInCart;
  next();
});

const enoughProductStock = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const product = await Product.findOne({ where: { id: productId } });

  if (product.quantity < quantity) {
    return next(
      new AppError(
        `Not enough stock. This product has only ${product.quantity} items available.`,
        400
      )
    );
  }

  next();
});

module.exports = {
  cartExists,
  productExistsInCart,
  enoughProductStock,
};
