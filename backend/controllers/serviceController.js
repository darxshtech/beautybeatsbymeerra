const MaintenanceService = require('../services/service/MaintenanceService');

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res, next) => {
  try {
    const response = await MaintenanceService.getServices(req.query);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create new service
 * @route   POST /api/services
 * @access  Private/Admin
 */
exports.createService = async (req, res, next) => {
  try {
    const response = await MaintenanceService.createService(req.body);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create dynamic package
 * @route   POST /api/services/package
 * @access  Private/Admin
 */
exports.createPackage = async (req, res, next) => {
  try {
    const { name, serviceIds, totalPrice, description } = req.body;
    const response = await MaintenanceService.createPackage(name, serviceIds, totalPrice, description);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};
