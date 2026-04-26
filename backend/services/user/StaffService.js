const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const ErrorResponse = require('../../utils/errorHandler');

class StaffService {
  /**
   * Get all staff members
   */
  async getStaff(query) {
    const staff = await User.find({
       role: { $in: ['ADMIN', 'STAFF'] }
    }).sort('name');

    return {
      success: true,
      count: staff.length,
      data: staff
    };
  }

  /**
   * Track staff performance logic
   * Based on completed services
   */
  async getStaffPerformance(staffId) {
    const totalCompletions = await Appointment.countDocuments({
      staff: staffId,
      status: 'COMPLETED'
    });

    const income = await Appointment.aggregate([
      { $match: { staff: staffId, status: 'COMPLETED' } },
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'serviceDetail'
        }
      },
      { $unwind: '$serviceDetail' },
      { $group: { _id: null, total: { $sum: '$serviceDetail.price' } } }
    ]);

    return {
      success: true,
      data: {
        totalCompletions,
        totalRevenueGenerated: income.length > 0 ? income[0].total : 0
      }
    };
  }
}

module.exports = new StaffService();
