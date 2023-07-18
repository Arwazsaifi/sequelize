const sequelize=require('../connection/database')
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const User = require('../models/user');
const AccessToken = require('../models/AccessToken');
const Address = require('../models/Address');
require('dotenv').config();


const registerUser = async (userData) => {
  const { username, password, confirmPassword, email, firstname, lastname } = userData;

  const userExist = await User.findOne({ where: { username } });

  if (userExist) {
    throw new Error('Username already exists.');
  }

  const emailExist = await User.findOne({ where: { email } });
  if (emailExist) {
    throw new Error('Email already exists.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const hashPass = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hashPass,
    email,
    firstname,
    lastname,
  });

  return { message: 'User registered successfully.' };
};

const loginUser = async (username, password) => {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw new Error('Invalid username.');
  }

  const passCorrect = await bcrypt.compare(password, user.password);
  if (!passCorrect) {
    throw new Error('Incorrect password.');
  }

  const accessToken = jwt.sign({ user_id: user.id }, 'secret_keys', { expiresIn: '1m' });

  await AccessToken.create({
    user_id: user.id,
    access_token: accessToken,
    expiry: new Date().getTime() + 36000,
  });

  return { access_token: accessToken };
};

const getUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found.');
  }
  return { user };
};

const deleteUser = async (userId) => {
  await User.destroy({ where: { id: userId } });
};

const getUsers = async (page) => {
  const limit = 10;
  const offset = (page - 1) * limit;

  const users = await User.findAll({ limit, offset });
  return users;
};

const userAddress = async (userId, addressData) => {
  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const address = await Address.create(addressData);

    await user.addAddress(address);

    return address;
  } catch (error) {
    console.error("error adding user",error);
    throw new Error('Failed to add user address');
  }
};

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, { include: [Address] });
  if (!user) {
    throw new Error('User not found.');
  }
  return user;
};

const deleteAddress = async (userId, addressIds) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  await user.removeAddresses(addressIds);
};

const sendResetPasswordEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('User not found with this email.');
  }

  const resetToken = jwt.sign({ user_id: user.id }, 'secret_key', { expiresIn: '1m' });

  let transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const resetLink = `http://localhost:6000/user/forget-password/${resetToken}`;

  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password reset request',
    text: `You have requested to reset your password. Please click the following link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions);

  return { message: 'Password reset token sent to your email', resetToken };
};

const sendResetPassword = async (passwordResetToken, password, confirmPassword) => {
  try {
    const decoded = jwt.verify(passwordResetToken, 'secret_key', { expiresIn: '5m' });
    const userId = decoded.user_id;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Invalid user.');
    }

    if (password !== confirmPassword) {
      throw new Error('Password and confirm password do not match.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    let transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const email = user.email;

    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Reset Password Confirmation',
      text: 'Your password has been successfully reset.',
    };

    transporter.sendMail(mailOptions);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Password reset token has expired.');
    }
    throw error;
  }
};

const uploadFileToCloudinary = async (file) => {
  cloudinary.config({
    cloud_name: process.env.NAME,
    api_key: process.env.KEY,
    api_secret: process.env.SECRET,
  });

  const result = await cloudinary.uploader.upload(file.path);

  return { message: 'Image uploaded successfully', imageUrl: result.secure_url };
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  deleteUser,
  getUsers,
  userAddress,
  getUserById,
  deleteAddress,
  sendResetPasswordEmail,
  sendResetPassword,
  uploadFileToCloudinary,
};
