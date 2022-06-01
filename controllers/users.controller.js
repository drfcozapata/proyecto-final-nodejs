const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// Models
const { User } = require('../models/user.model');
const { Order } = require('../models/order.model');
const { Product } = require('../models/product.model');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
  });

  res.status(200).json({
    users,
  });
});

const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
    role,
  });

  newUser.password = undefined;
  res.status(201).json({
    status: 'User successfully created',
    newUser,
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate that user exists with given email
  const user = await User.findOne({
    where: { email, status: 'active' },
  });

  // Compare password with db
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid credentials', 400));
  }

  // Generate JWT
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;
  res.status(200).json({
    status: 'Login successful',
    token,
    user,
  });
});

const getUserProducts = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const userProducts = await Product.findAll({
    where: {
      userId: sessionUser.id,
    },
  });

  if (userProducts.length === 0) {
    return next(new AppError('No products found for this user', 404));
  } else {
    res.status(200).json({
      userProducts,
    });
  }
});

const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { name, email } = req.body;

  await user.update({ name, email });

  res.status(200).json({
    status: 'User successfully updated',
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'deleted' });

  res.status(200).json({
    status: 'User successfully deleted',
  });
});

const getUserOrders = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const userOrders = await Order.findAll({
    where: {
      userId: sessionUser.id,
      status: 'purchased',
    },
  });

  if (userOrders.length === 0) {
    return next(new AppError('No orders found for this user', 404));
  } else {
    res.status(200).json({
      userOrders,
    });
  }
});

const getUserOrderById = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  const userOrder = await Order.findOne({
    where: {
      userId: sessionUser.id,
      id,
      status: 'purchased',
    },
  });

  if (!userOrder) {
    return next(new AppError(`Order with ID: ${id} does not exist`, 404));
  } else {
    res.status(200).json({
      userOrder,
    });
  }
});

const checkToken = catchAsync(async (req, res, next) => {
  res.status(200).json({
    user: req.sessionUser,
  });
});

module.exports = {
  getAllUsers,
  createUser,
  login,
  getUserProducts,
  updateUser,
  deleteUser,
  getUserOrders,
  getUserOrderById,
  checkToken,
};
