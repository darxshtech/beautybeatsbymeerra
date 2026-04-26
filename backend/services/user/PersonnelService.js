const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorHandler');

class PersonnelService {
  /**
   * Get all personnel (STAFF and ADMIN)
   */
  async getPersonnel(query) {
    let queryStr = { role: { $in: ['STAFF', 'ADMIN'] } };

    // By default, only show people NOT on leave
    if (query.includeOff !== 'true') {
      queryStr.isOff = { $ne: true };
    }

    if (query.search) {
      queryStr.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } }
      ];
    }

    const personnel = await User.find(queryStr)
      .select('name specialization image description isOff role email phone password')
      .sort('-createdAt');

    return {
      success: true,
      count: personnel.length,
      data: personnel
    };
  }

  /**
   * Update personnel status or info
   */
  async updatePersonnel(id, data) {
    const user = await User.findById(id);

    if (!user) {
      throw new ErrorResponse('Personnel not found', 404);
    }

    // Update fields
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== '') {
        user[key] = data[key];
      }
    });

    await user.save();

    return {
      success: true,
      data: user
    };
  }
  /**
   * Create new personnel
   */
  async createPersonnel(data) {
    const { email } = data;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ErrorResponse('Personnel with this email already exists', 400);
    }

    const personnel = await User.create(data);

    return {
      success: true,
      data: personnel
    };
  }
}

module.exports = new PersonnelService();
