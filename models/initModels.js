const { Cart } = require('./cart.model');
const { Category } = require('./category.model');
const { Order } = require('./order.model');
const { Product } = require('./product.model');
const { ProductImg } = require('./productImg.model');
const { ProductsInCart } = require('./productsInCart.model');
const { User } = require('./user.model');

// Relationships between models
const initModels = () => {
  User.hasMany(Product);
  Product.belongsTo(User);

  User.hasOne(Cart);
  Cart.belongsTo(User);

  User.hasMany(Order);
  Order.belongsTo(User);

  Cart.hasOne(Order);
  Order.belongsTo(Cart);

  Cart.hasMany(ProductsInCart);
  ProductsInCart.belongsTo(Cart);

  Category.hasOne(Product);
  Product.belongsTo(Category);

  Product.hasOne(ProductsInCart);
  ProductsInCart.belongsTo(Product);

  Product.hasMany(ProductImg);
  ProductImg.belongsTo(Product);
};

module.exports = { initModels };
