const MaintenanceService = require('../services/service/MaintenanceService');

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
exports.getServices = async (req, res, next) => {
  try {
    // Do not inject req.branch so admin can see services from all branches.
    // Public client/clinic websites should pass ?branch=SALON or ?branch=CLINIC explicitly.
    const query = { ...req.query };
    const response = await MaintenanceService.getServices(query);
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
    const data = { ...req.body };
    // Only apply branch from header if branch isn't specified in the body
    if (!data.branch) {
      data.branch = req.branch;
    }
    const response = await MaintenanceService.createService(data);
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

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private/Admin
 */
exports.updateService = async (req, res, next) => {
  try {
    const service = await require('../models/Service').findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Private/Admin
 */
exports.deleteService = async (req, res, next) => {
  try {
    const service = await require('../models/Service').findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
