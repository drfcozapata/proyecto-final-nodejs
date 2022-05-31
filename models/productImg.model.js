const { DataTypes } = require('sequelize');
const { db } = require('../utils/database');

const ProductImg = db.define('productImg', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  imgUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
});

module.exports = { ProductImg };
