const Attendance = require('../models/Attendance');
const AdminNotification = require('../models/AdminNotification');
const User = require('../models/User');

/**
 * Helper: get today's date string in IST (YYYY-MM-DD)
 */
function getTodayIST() {
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().split('T')[0];
}

/**
 * @desc    Employee clock-in
 * @route   POST /api/attendance/clock-in
 * @access  Private (STAFF/ADMIN)
 */
exports.clockIn = async (req, res, next) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const today = getTodayIST();

    // Check if already clocked in today
    const existing = await Attendance.findOne({ 
      employee: employeeId, 
      date: today,
      status: 'CLOCKED_IN'
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already clocked in today. Clock out first.' 
      });
    }

    const ua = req.headers['user-agent'] || 'Unknown Device';
    let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (typeof ipAddress === 'string') {
      ipAddress = ipAddress.split(',')[0].trim(); // Get the first IP in the chain
    }
    
    // Improved device cleaner
    const parseUA = (uaString) => {
      let os = 'Unknown OS';
      if (uaString.includes('Windows')) os = 'Windows';
      else if (uaString.includes('Android')) os = 'Android';
      else if (uaString.includes('iPhone')) os = 'iPhone';
      else if (uaString.includes('iPad')) os = 'iPad';
      else if (uaString.includes('Mac OS')) os = 'Mac';
      else if (uaString.includes('Linux')) os = 'Linux';

      let browser = 'Unknown Browser';
      if (uaString.includes('Chrome')) browser = 'Chrome';
      else if (uaString.includes('Safari')) browser = 'Safari';
      else if (uaString.includes('Firefox')) browser = 'Firefox';
      else if (uaString.includes('Edge')) browser = 'Edge';

      const type = /mobile/i.test(uaString) ? 'Mobile' : 'Desktop';
      return `${type} - ${os} (${browser})`;
    };

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      clockIn: new Date(),
      status: 'CLOCKED_IN',
      ipAddress: ipAddress,
      deviceName: parseUA(ua)
    });

    // Notify admin
    const employee = await User.findById(employeeId);
    await AdminNotification.create({
      type: 'EMPLOYEE_CLOCK_IN',
      title: 'Employee Clocked In',
      message: `${employee?.name || 'Staff'} has clocked in at ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      employee: employeeId
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Employee clock-out
 * @route   POST /api/attendance/clock-out
 * @access  Private (STAFF/ADMIN)
 */
exports.clockOut = async (req, res, next) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const today = getTodayIST();

    const attendance = await Attendance.findOne({ 
      employee: employeeId, 
      date: today,
      status: 'CLOCKED_IN'
    });

    if (!attendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'No active clock-in found for today.' 
      });
    }

    const clockOut = new Date();
    const totalHours = ((clockOut - attendance.clockIn) / (1000 * 60 * 60)).toFixed(2);

    attendance.clockOut = clockOut;
    attendance.totalHours = parseFloat(totalHours);
    attendance.status = 'CLOCKED_OUT';
    await attendance.save();

    // Notify admin
    const employee = await User.findById(employeeId);
    await AdminNotification.create({
      type: 'EMPLOYEE_CLOCK_OUT',
      title: 'Employee Clocked Out',
      message: `${employee?.name || 'Staff'} has clocked out at ${clockOut.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}. Total hours: ${totalHours}h`,
      employee: employeeId
    });

    res.status(200).json({ success: true, data: attendance });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current attendance status for employee
 * @route   GET /api/attendance/status
 * @access  Private (STAFF/ADMIN)
 */
exports.getMyStatus = async (req, res, next) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const today = getTodayIST();

    const attendance = await Attendance.findOne({ 
      employee: employeeId, 
      date: today 
    }).sort('-clockIn');

    res.status(200).json({ success: true, data: attendance || null });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all attendance logs (admin view)
 * @route   GET /api/attendance
 * @access  Private (ADMIN)
 */
exports.getAllAttendance = async (req, res, next) => {
  try {
    const { date, employeeId } = req.query;
    const filter = {};
    
    if (date) filter.date = date;
    if (employeeId) filter.employee = employeeId;

    const logs = await Attendance.find(filter)
      .populate('employee', 'name email phone role')
      .sort('-date -clockIn');

    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get attendance logs for a specific employee
 * @route   GET /api/attendance/my-logs
 * @access  Private (STAFF/ADMIN)
 */
exports.getMyLogs = async (req, res, next) => {
  try {
    const employeeId = req.user._id || req.user.id;
    
    const logs = await Attendance.find({ employee: employeeId })
      .sort('-date -clockIn')
      .limit(30);

    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};
