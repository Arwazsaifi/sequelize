const { DataTypes } = require('sequelize');
const sequelize = require('../connection/database');
const Address=require('./Address');

const User = sequelize.define('Users', {
  username: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  firstname: DataTypes.STRING,
  lastname: DataTypes.STRING,
  
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

});


module.exports = User;
