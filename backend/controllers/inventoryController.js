const InventoryService = require('../services/inventory/InventoryService');

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private/Admin/Staff
 */
exports.getInventory = async (req, res, next) => {
  try {
    const response = await InventoryService.getInventory(req.query);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add new item to inventory
 * @route   POST /api/inventory
 * @access  Private/Admin
 */
exports.addItem = async (req, res, next) => {
  try {
    const response = await InventoryService.addItem({
      ...req.body,
      lastUpdatedBy: req.user.id
    });
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update stock level
 * @route   PUT /api/inventory/:id
 * @access  Private/Admin/Staff
 */
exports.updateStock = async (req, res, next) => {
  try {
    const response = await InventoryService.updateItem(req.params.id, req.body, req.user.id);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Adjust stock level (Quick IN/OUT)
 * @route   POST /api/inventory/:id/adjust
 * @access  Private/Admin/Staff
 */
exports.adjustStock = async (req, res, next) => {
  try {
    const { amount, mode } = req.body;
    const response = await InventoryService.adjustStock(req.params.id, amount, mode, req.user.id);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
