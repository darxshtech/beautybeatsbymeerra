const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const ErrorResponse = require('../../utils/errorHandler');

class CustomerService {
  /**
   * Get all customers with pagination, sorting, and filtering
   */
  async getCustomers(query) {
    let queryStr = { role: 'CUSTOMER' };

    // Filtering by name or phone
    if (query.search) {
      queryStr.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } }
      ];
    }

    // Filtering by registration source (ONLINE / WALKIN)
    if (query.source) {
      queryStr.registrationSource = query.source;
    }

    // Pagination
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = query.sort || '-createdAt';

    const customers = await User.find(queryStr)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(queryStr);

    return {
      success: true,
      count: customers.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: customers
    };
  }

  /**
   * Get single customer with history and loyalty points
   */
  async getCustomerById(id) {
    const customer = await User.findById(id);

    if (!customer || customer.role !== 'CUSTOMER') {
      throw new ErrorResponse('Customer not found', 404);
    }

    // Get appointment history
    const history = await Appointment.find({ customer: id })
      .populate('service', 'name price')
      .sort('-appointmentDate')
      .limit(10);

    return {
      success: true,
      data: {
        profile: customer,
        history
      }
    };
  }

  /**
   * Create new customer
   */
  async createCustomer(data) {
    if (data.dateOfBirth !== undefined) {
      if (data.dateOfBirth && data.dateOfBirth !== '') {
        data.birthday = new Date(data.dateOfBirth);
      } else {
        data.birthday = null;
      }
      delete data.dateOfBirth;
    }
    const customer = await User.create({
      ...data,
      role: 'CUSTOMER'
    });

    return {
      success: true,
      data: customer
    };
  }

  /**
   * Update customer profile
   */
  async updateCustomer(id, data) {
    let customer = await User.findById(id);

    if (!customer || customer.role !== 'CUSTOMER') {
      throw new ErrorResponse('Customer not found', 404);
    }

    // Handle dateOfBirth -> birthday mapping
    if (data.dateOfBirth !== undefined) {
      if (data.dateOfBirth && data.dateOfBirth !== '') {
        data.birthday = new Date(data.dateOfBirth);
      } else {
        data.birthday = null;
      }
      delete data.dateOfBirth;
    }

    // Remove empty string fields that would fail validation
    if (data.anniversary === '') data.anniversary = null;

    customer = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });

    return {
      success: true,
      data: customer
    };
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id) {
    const customer = await User.findById(id);

    if (!customer || customer.role !== 'CUSTOMER') {
      throw new ErrorResponse('Customer not found', 404);
    }

    // Optional: Delete related appointments or billing?
    // For now just deleting the user
    await customer.deleteOne();

    return {
      success: true,
      data: {}
    };
  }
}

module.exports = new CustomerService();
