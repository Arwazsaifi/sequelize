const { DataTypes } = require('sequelize');
const sequelize=require('../connection/database')

const AccessToken = sequelize.define('AccessToken', {
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  access_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiry: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = AccessToken;