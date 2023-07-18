const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AccessToken = require('../models/AccessToken');

const validationAccessToken = async (req, res, next) => {
  const access_token = req.headers.authorization;

  try {
    const decoded = jwt.verify(access_token, 'secret_key');

    const user_id = decoded.user_id;

    // Find the user by ID using Sequelize
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(400).json({ error: 'Invalid access token' });
    }

    const accessToken = await AccessToken.findOne({ where: { access_token } });
    if (!accessToken) {
      return res.status(400).json({ error: 'Invalid access token' });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.expiry < currentTime) {
      await AccessToken.destroy({ where: { access_token } });
      return res.status(401).json({ error: 'Access token has expired' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Invalid access token' });
  }
};

module.exports = validationAccessToken;
