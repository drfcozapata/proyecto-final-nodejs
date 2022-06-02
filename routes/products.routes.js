const express = require('express');

// Middlewares
const {
  protectAdmin,
  protectToken,
} = require('../middlewares/users.middlewares');
const {
  createProductValidations,
  checkValidations,
} = require('../middlewares/validations.middlewares');
const {
  productExists,
  protectProductOwner,
} = require('../middlewares/products.middleware');

// Controllers
const { checkToken } = require('../controllers/users.controller');
const {
  createProduct,
  getAllProducts,
  getProducById,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createNewCategory,
  updateCategory,
} = require('../controllers/products.controller');

const router = express.Router();

// Routes unprotected
router.get('/', getAllProducts);
router.get('/categories', getAllCategories);
router.get('/:id', productExists, getProducById);

// Apply protectToken middleware and checkToken controller
router.use(protectToken);
router.get('/check-token', checkToken);

// Routes
router.post('/', createProductValidations, checkValidations, createProduct);
router.post('/categories', protectAdmin, createNewCategory);
router.patch('/categories/:id', protectAdmin, updateCategory);
router
  .route('/:id', productExists, protectProductOwner)
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = { productsRouter: router };
