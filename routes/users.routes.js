const express = require('express');

// Middlewares
const {
  userExists,
  protectAdmin,
  protectToken,
  protectAccountOwner,
} = require('../middlewares/users.middlewares');
const {
  createUserValidations,
  checkValidations,
} = require('../middlewares/validations.middlewares');

// Controller
const {
  getAllUsers,
  createUser,
  login,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserOrderById,
  checkToken,
} = require('../controllers/users.controller');

const router = express.Router();

// Not protected routes
router.post('/', createUserValidations, checkValidations, createUser);
router.post('/login', login);

// Apply protectToken middleware and checkToken controller
router.use(protectToken);
router.get('/check-token', checkToken);

router.get('/', protectAdmin, getAllUsers);
router.get('/me', getUserProducts);
router.get('/orders', getUserOrders);
router.get('/orders/:id', getUserOrderById);

router
  .route('/:id')
  .patch(userExists, protectAccountOwner, updateUser)
  .delete(userExists, protectAccountOwner, deleteUser);

module.exports = { usersRouter: router };
