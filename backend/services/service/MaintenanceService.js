const Service = require('../../models/Service');
const ErrorResponse = require('../../utils/errorHandler');

class MaintenanceService {
  /**
   * Get all services with dynamic pricing/category
   */
  async getServices(query) {
    let queryObj = {};
    if (query.search) {
      queryObj.name = { $regex: query.search, $options: 'i' };
    }

    const limit = parseInt(query.limit) || 100;
    const services = await Service.find(queryObj).limit(limit).sort('category name');
    
    return {
      success: true,
      count: services.length,
      data: services
    };
  }

  /**
   * Add new service
   */
  async createService(data) {
    const service = await Service.create(data);

    return {
      success: true,
      data: service
    };
  }

  /**
   * Create dynamic packages (e.g. Gold/Silver)
   * A package can be a bundle of services
   */
  async createPackage(name, serviceIds, totalPrice, description) {
    // We can store packages in the same Service model or separate
    // For now we'll assume a package is just a Service with a bundle of names
    const servicePkg = await Service.create({
      name,
      description,
      price: totalPrice,
      category: 'Package',
      duration: 120, // Example average
      isBundle: true,
      subServices: serviceIds
    });

    return {
      success: true,
      data: servicePkg
    };
  }
}

module.exports = new MaintenanceService();
