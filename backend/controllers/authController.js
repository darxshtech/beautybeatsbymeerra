const AuthService = require('../services/auth/AuthService');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Login/SignUp with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const response = await AuthService.googleLogin(idToken);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const response = await AuthService.login(email, password);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public (Can be restricted later)
 */
exports.register = async (req, res, next) => {
  try {
    const response = await AuthService.register(req.body);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    if (req.user.id === 'SYSTEM_ADMIN_ID' || req.user.id === '000000000000000000000000') {
      return res.status(200).json({
        success: true,
        data: {
          _id: '000000000000000000000000',
          name: 'System Admin',
          email: process.env.ADMIN_EMAIL,
          role: 'ADMIN'
        }
      });
    }
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
