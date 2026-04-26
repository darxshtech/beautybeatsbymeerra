const Inventory = require('../../models/Inventory');
const ErrorResponse = require('../../utils/errorHandler');

class InventoryService {
  /**
   * Get all inventory items with low-stock filtering
   */
  async getInventory(query) {
    let queryStr = {};

    // Filter low stock
    if (query.lowStock === 'true') {
      queryStr.$expr = { $lte: ['$stockCount', '$reorderLevel'] };
    }

    const items = await Inventory.find(queryStr)
      .populate('lastUpdatedBy', 'name')
      .sort('itemName');

    return {
      success: true,
      count: items.length,
      data: items
    };
  }
  
  /**
   * Add new item to inventory
   */
  async addItem(data) {
    const item = await Inventory.create(data);
    return {
      success: true,
      data: item
    };
  }

  /**
   * Add or update new stock item
   */
  async updateItem(id, data, userId) {
    let item = await Inventory.findById(id);

    if (!item) {
       throw new ErrorResponse('Inventory item not found', 404);
    }

    item = await Inventory.findByIdAndUpdate(id, {
      ...data,
      lastUpdatedBy: userId,
      updatedAt: new Date()
    }, { new: true });

    return {
      success: true,
      data: item
    };
  }

  /**
   * Quick Stock In/Out Adjustment logic
   */
  async adjustStock(id, amount, mode, userId) {
    const item = await Inventory.findById(id);
    if (!item) throw new ErrorResponse('Item not found', 404);

    const adjustment = mode === 'IN' ? amount : -amount;
    
    item.stockCount += adjustment;
    item.lastUpdatedBy = userId;
    item.updatedAt = new Date();

    const saved = await item.save();
    return {
      success: true,
      data: saved
    };
  }
}

module.exports = new InventoryService();
