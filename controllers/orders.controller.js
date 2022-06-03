// Models
const { Cart } = require('../models/cart.model');
const { ProductsInCart } = require('../models/productsInCart.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const getUserCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    attributes: ['id', 'userId', 'status'],
    include: [
      {
        model: ProductsInCart,
        attributes: ['id', 'productId', 'quantity', 'status'],
        include: [
          {
            model: Product,
            attributes: ['id', 'title', 'description', 'price'],
          },
        ],
      },
    ],
  });

  res.status(200).json({ status: 'success', cart });
});

const addProductToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;

  // Validate that there is enough product in stock
  const product = await Product.findOne({
    where: { id: productId },
    status: 'active',
  });

  if (!product) {
    return next(new AppError('There is no product with that ID', 404));
  } else if (quantity > product.quantity) {
    return next(
      new AppError(
        `This product only has ${product.quantity} items available.`,
        400
      )
    );
  }

  // Fetch current active cart; if it doesn't exist, create a new one
  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  // Create new cart if it doesn't exist
  if (!cart) {
    const newCart = await Cart.create({ userId: sessionUser.id });

    // Add product to the cart
    await ProductsInCart.create({ cartId: newCart.id, productId, quantity });
    // Update product quantity
    await Product.update(
      { quantity: product.quantity - quantity },
      { where: { id: productId } }
    );
  } else {
    // Validate if product already exists in the cart
    const productInCart = await ProductsInCart.findOne({
      where: { cartId: cart.id, productId },
      include: [{ model: Product, attributes: ['id', 'title', 'price'] }],
    });

    // Validate if product already exists in the cart as "removed"; update quantity and status
    if (productInCart && productInCart.status === 'removed') {
      await ProductsInCart.update(
        { quantity: quantity, status: 'active' },
        { where: { id: productInCart.id } }
      );
    } else if (productInCart) {
      return next(
        new AppError(
          `You already have ${productInCart.quantity} ${productInCart.product.title} in your cart. If you want to add more, please change the quantity in "Update Product".`,
          400
        )
      );
    }

    // Add product to current cart
    await ProductsInCart.create({ cartId: cart.id, productId, quantity });
  }

  res.status(200).json({
    status: 'Product successfully added to cart.',
  });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { productId, newQty } = req.body;
  const { sessionUser } = req;

  // Get user's cart
  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!cart) {
    return next(
      new AppError(
        'There is no active cart for this user. Please, create it.',
        404
      )
    );
  }

  // Validate that there is enough product in stock
  const product = await Product.findOne({ where: { id: productId } });

  if (!product) {
    return next(new AppError('There is no product with that ID.', 404));
  } else if (newQty > product.quantity) {
    return next(
      new AppError(
        `This product only has ${product.quantity} items available.`,
        400
      )
    );
  }

  // Validate if product already exists in the cart
  const productInCart = await ProductsInCart.findOne({
    where: { cartId: cart.id, productId, status: 'active' },
    include: [
      {
        model: Product,
        attributes: ['id', 'title', 'description', 'price', 'status'],
      },
    ],
  });

  // Send error if it exists
  if (!productInCart) {
    return next(new AppError("You don't have that product in your cart", 400));
  }

  // Validate if new quantity is negative
  if (newQty < 0) {
    return next(new AppError("You can't set a negative quantity", 400));
  }

  // If newQty is 0, delete product from cart
  if (newQty === 0) {
    await productInCart.update(
      { status: 'removed', quantity: 0 },
      { where: { id: productInCart.id } }
    );
  } else if (newQty > 0) {
    // Update product quantity
    await productInCart.update(
      { quantity: newQty, status: 'active' },
      { where: { id: productInCart.id } }
    );
  }

  res.status(200).json({
    status: 'Product quantity successfully updated',
  });
});

const deleteProductFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { sessionUser } = req;

  // Get user's cart
  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  if (!cart) {
    return next(
      new AppError(
        'There is no active cart for this user. Please, create it.',
        404
      )
    );
  }

  // Validate if product already exists in the cart
  const productInCart = await ProductsInCart.findOne({
    where: { cartId: cart.id, productId, status: 'active' },
  });

  // Send error if it does not exists
  if (!productInCart) {
    return next(new AppError("You don't have that product in your cart", 400));
  }

  await productInCart.update(
    { status: 'removed', quantity: 0 },
    { where: { id: productInCart.id } }
  );

  res.status(200).json({
    status: 'Product successfully deleted from cart.',
  });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  // Get user's cart
  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: [{ model: ProductsInCart, include: [{ model: Product }] }],
  });
  if (!cart) {
    return next(
      new AppError(
        'There is no active cart for this user. Please, create it.',
        404
      )
    );
  }

  // Get all products in the cart
  const productsInCart = await ProductsInCart.findAll({
    where: { cartId: cart.id, status: 'active' },
    attributes: ['id', 'productId', 'quantity'],
    include: [{ model: Product, attributes: ['id', 'title', 'price'] }],
  });

  // Asyncronous loop
  productsInCart.forEach(async individualProduct => {
    // Update products in stock
    const updatedProduct = await Product.findOne({
      where: { id: individualProduct.productId },
    });

    const newQuantity = +updatedProduct.quantity - +individualProduct.quantity;

    await Product.update(
      { quantity: newQuantity },
      { where: { id: updatedProduct.id } }
    );
  });

  // Syncronous loop to update products in cart
  let totalPrice = 0;
  productsInCart.forEach(individualProduct => {
    // Cart's total price
    totalPrice += individualProduct.product.price * individualProduct.quantity;

    // Update products in cart status
    individualProduct.update({ status: 'purchased' });
  });

  // Update cart status
  await Cart.update(
    {
      status: 'purchased',
    },
    { where: { id: cart.id } }
  );

  // Register purchase in orders
  await Order.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
    status: 'purchased',
  });

  res.status(200).json({
    status: 'Cart successfully purchased and orders updated',
  });
});

module.exports = {
  getUserCart,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  purchaseCart,
};
