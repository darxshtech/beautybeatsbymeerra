const express = require('express');
const router = express.Router();
const { 
  getInventory, 
  addItem, 
  updateStock,
  adjustStock
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');
const inventoryValidator = require('../validators/inventory/inventoryValidator');

router.get('/', protect, authorize('ADMIN', 'STAFF'), getInventory);
router.post('/', protect, authorize('ADMIN'), validate(inventoryValidator.item), addItem);
router.put('/:id', protect, authorize('ADMIN', 'STAFF'), validate(inventoryValidator.item), updateStock);
router.post('/:id/adjust', protect, authorize('ADMIN', 'STAFF'), validate(inventoryValidator.adjust), adjustStock);

module.exports = router;
