const { body, validationResult } = require('express-validator');

// Utils
const { AppError } = require('../utils/appError');

const createUserValidations = [
  body('name').notEmpty().withMessage('Name cannot be empty'),
  body('email')
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const createProductValidations = [
  body('title').notEmpty().withMessage('Product title cannot be empty'),
  body('description')
    .notEmpty()
    .withMessage('Product description cannot be empty'),
  body('quantity')
    .notEmpty()
    .withMessage('Product quantity cannot be empty')
    .isInt({ min: 1 })
    .withMessage('Product quantity must be greater than 0'),
  body('price')
    .notEmpty()
    .withMessage('Product price cannot be empty')
    .isFloat({ min: 1 })
    .withMessage('Product price must be greater than 0'),
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Must provide a valid category ID'),
];

const createNewCategoryValidations = [
  body('name').notEmpty().withMessage('Category name cannot be empty'),
];

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map(({ msg }) => msg);

    // [msg, msg, msg] -> 'msg. msg. msg'
    const errorMsg = messages.join('. ');

    return next(new AppError(errorMsg, 400));
  }

  next();
};

module.exports = {
  createUserValidations,
  createProductValidations,
  createNewCategoryValidations,
  checkValidations,
};
