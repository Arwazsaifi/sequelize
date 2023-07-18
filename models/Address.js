const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');
const User = require('./user');

const Address = sequelize.define('Addresses', {
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  pin_code: DataTypes.STRING,
  phone_no: DataTypes.STRING,
});


module.exports = Address;
