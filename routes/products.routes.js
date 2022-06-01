const express = require('express');

// Middlewares
const {
  protectAdmin,
  protectToken,
} = require('../middlewares/users.middlewares');
const {
  createProductValidations,
  createNewCategoryValidations,
  checkValidations,
} = require('../middlewares/validations.middlewares');
const {
  productExists,
  protectProductOwner,
} = require('../middlewares/products.middleware');
const { categoryExists } = require('../middlewares/categories.middleware');

// Controllers
const { checkToken } = require('../controllers/users.controller');
const {
  createProduct,
  getAllProducts,
  getProducById,
  updateProduct,
  deleteProduct,
  getCategories,
  createNewCategory,
  updateCategory,
} = require('../controllers/products.controller');

const router = express.Router();

// Routes unprotected
router.get('/', getAllProducts);
router.get('/:id', productExists, getProducById);

// Apply protectToken middleware and checkToken controller
router.use(protectToken);
router.get('/check-token', checkToken);

// Routes
router.post('/', createProductValidations, checkValidations, createProduct);
router
  .route('/:id', productExists, protectProductOwner)
  .patch(updateProduct)
  .delete(deleteProduct);
router
  .route('/categories')
  .get(getCategories)
  .post(
    protectAdmin,
    createNewCategoryValidations,
    checkValidations,
    createNewCategory
  );
router.patch('/categories/:id', protectAdmin, categoryExists, updateCategory);

module.exports = { productsRouter: router };
