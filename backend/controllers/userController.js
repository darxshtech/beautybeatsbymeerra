const CustomerService = require('../services/user/CustomerService');
const PersonnelService = require('../services/user/PersonnelService');
const User = require('../models/User');

/**
 * @desc    Get all personnel
 * @route   GET /api/users/staff
 * @access  Private/Admin
 */
exports.getPersonnel = async (req, res, next) => {
  try {
    const response = await PersonnelService.getPersonnel(req.query);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create personnel
 * @route   POST /api/users/staff
 * @access  Private/Admin
 */
exports.createPersonnel = async (req, res, next) => {
  try {
    const response = await PersonnelService.createPersonnel(req.body);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all customers
 * @route   GET /api/users/customers
 * @access  Private/Admin/Staff
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const response = await CustomerService.getCustomers(req.query);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create customer
 * @route   POST /api/users/customers
 * @access  Private/Admin/Staff
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const response = await CustomerService.createCustomer(req.body);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single customer
 * @route   GET /api/users/customers/:id
 * @access  Private/Admin/Staff
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const response = await CustomerService.getCustomerById(req.params.id);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/users/customers/:id
 * @access  Private/Admin
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const targetId = req.params.id || req.user.id;
    const currentUserId = req.user._id.toString();
    const targetUserId = targetId.toString();

    if (req.user.role !== 'ADMIN' && currentUserId !== targetUserId) {
      return res.status(403).json({ success: false, message: `Not authorized.` });
    }

    // Fetch user to check role
    const User = require('../models/User');
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let response;
    if (targetUser.role === 'CUSTOMER') {
      response = await CustomerService.updateCustomer(targetUserId, req.body);
    } else {
      response = await PersonnelService.updatePersonnel(targetUserId, req.body);
    }
    
    res.status(200).json(response);
  } catch (err) {
    if (err.code === 11000 || (err.name === 'MongoServerError' && err.message.includes('E11000'))) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(400).json({ success: false, message: `A user with this ${field} already exists.` });
    }
    next(err);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const response = await CustomerService.deleteCustomer(req.params.id);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
