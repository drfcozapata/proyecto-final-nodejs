// Models
const { Cart } = require('../models/cart.model');
const { ProductsInCart } = require('../models/productsInCart.model');
const { Product } = require('../models/product.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');

const addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser, cart } = req;

  if (!cart) {
    // Create a new cart
    const newCart = await Cart.create({ userId: sessionUser.id });
    // Create a new product in the cart
    await ProductsInCart.create({ cartId: newCart.id, productId, quantity });
    await Product.update({ quantity: product.quantity - quantity });
  } else {
    // Check if the product already exists in the cart
    const productInCart = await ProductsInCart.findOne({
      where: { cartId: cart.id, productId, status: 'active' },
    });

    await ProductsInCart.update(
      { quantity: productInCart.quantity + quantity },
      { where: { cartId: cart.id, productId } }
    );
    await Product.update(
      { quantity: productId.quantity - quantity },
      { where: { id: productId } }
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully.',
  });
});

const updateCartInCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { cart } = req;

  const productInCart = await ProductsInCart.findOne({
    where: { cartId: cart.id, productId, status: 'active' },
  });

  if (quantity === 0) {
    await ProductsInCart.update(
      { status: 'removed' },
      { where: { cartId: cart.id, productId } }
    );
    await Product.update(
      { quantity: productId.quantity + productInCart.quantity },
      { where: { id: productId } }
    );
  } else {
    await ProductsInCart.update(
      { quantity: productInCart.quantity + quantity },
      { where: { cartId: cart.id, productId } }
    );
    await Product.update(
      { quantity: productId.quantity - quantity },
      { where: { id: productId } }
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Product quantity updated successfully.',
  });
});

const deleteProductFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const { cart } = req;

  const productInCart = await ProductsInCart.findOne({
    where: { cartId: cart.id, productId, status: 'active' },
  });
  // Update the product's quantity
  await ProductsInCart.update(
    { status: 'removed' },
    { where: { cartId: cart.id, productId } }
  );
  await Product.update({
    quantity: productId.quantity + productInCart.quantity,
  });

  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully.',
  });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser, cart } = req;

  // Update the cart's status
  await Cart.update(
    { status: 'purchased' },
    { where: { userId: sessionUser.id, status: 'active' } }
  );

  res.status(200).json({
    status: 'success',
    message: 'Cart purchased successfully.',
    cart,
  });
});

module.exports = {
  addProductToCart,
  updateCartInCart,
  deleteProductFromCart,
  purchaseCart,
};
