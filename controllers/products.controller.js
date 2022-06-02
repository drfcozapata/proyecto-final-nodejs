// Models
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');
const { User } = require('../models/user.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');

const createProduct = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { title, description, quantity, price, categoryId } = req.body;

  const newProduct = await Product.create({
    title,
    description,
    quantity,
    price,
    categoryId,
    userId: sessionUser.id,
  });

  res.status(201).json({
    status: 'success',
    newProduct,
  });
});

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { status: 'active' },
    include: [
      { model: Category, attributes: ['name'] },
      { model: User, attributes: ['username', 'email'] },
    ],
  });

  res.status(200).json({
    status: 'success',
    results: products.length,
    products,
  });
});

const getProducById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({
    where: { id, status: 'active' },
    include: [
      { model: Category, attributes: ['name'] },
      { model: User, attributes: ['username', 'email'] },
    ],
  });

  res.status(200).json({
    status: 'success',
    product,
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, quantity, price } = req.body;

  const product = await Product.findOne({
    where: { id, status: 'active' },
  });

  const updatedProduct = await product.update({
    title,
    description,
    quantity,
    price,
  });

  res.status(200).json({
    status: 'Product successfully updated',
    product: updatedProduct,
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({
    where: { id, status: 'active' },
  });

  await product.update({ status: 'removed' });

  res.status(200).json({
    status: 'Product successfully deleted',
  });
});

const getAllCategories = catchAsync(async (req, res, next) => {
  const allCategories = await Category.findAll({
    where: { status: 'active' },
  });

  res.status(200).json({
    status: 'success',
    allCategories,
  });
});

const createNewCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (name.length === 0) {
    return next(new AppError('Category name cannot be empty', 400));
  }

  const newCategory = await Category.create({
    name,
  });

  res.status(201).json({
    status: 'New category successfully created',
    newCategory,
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findOne({
    where: { id, status: 'active' },
  });

  if (!category) {
    return next(new AppError('Category not found with that ID', 404));
  }
  if (name.length === 0) {
    return next(new AppError('Category new name cannot be empty', 400));
  }

  const updatedCategory = await category.update({
    name,
  });

  res.status(200).json({
    status: 'success',
    category: updatedCategory,
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProducById,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createNewCategory,
  updateCategory,
};
