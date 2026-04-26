const Billing = require('../models/Billing');
const Appointment = require('../models/Appointment');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalSales = await Billing.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    const totalAppointments = await Appointment.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalExpenses = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const recentAppointments = await Appointment.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name');

    res.json({
      success: true,
      data: {
        revenue: { total: totalSales[0] ? totalSales[0].total : 0 },
        appointments: { total: totalAppointments, completed: await Appointment.countDocuments({ status: 'COMPLETED' }) },
        customers: { total: totalCustomers },
        expenses: totalExpenses[0] ? totalExpenses[0].total : 0,
        recentAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top performing services
// @route   GET /api/reports/top-services
// @access  Private/Admin
const getTopServices = async (req, res) => {
  try {
    const topServices = await Appointment.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      { $unwind: { path: '$serviceInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$serviceInfo.name', 'Unknown'] },
          count: 1,
          revenue: { $multiply: [{ $ifNull: ['$serviceInfo.price', 0] }, '$count'] }
        }
      }
    ]);

    res.json({ success: true, data: topServices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get revenue by period
// @route   GET /api/reports/revenue?filter=today|week|month
// @access  Private/Admin
const getRevenueByPeriod = async (req, res) => {
  try {
    const { filter } = req.query;
    const now = new Date();
    let startDate;

    switch (filter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const revenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);

    const expenses = await Expense.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const appointments = await Appointment.countDocuments({
      createdAt: { $gte: startDate },
      status: { $ne: 'CANCELLED' }
    });

    res.json({
      success: true,
      data: {
        revenue: revenue[0] ? revenue[0].total : 0,
        invoiceCount: revenue[0] ? revenue[0].count : 0,
        expenses: expenses[0] ? expenses[0].total : 0,
        profit: (revenue[0] ? revenue[0].total : 0) - (expenses[0] ? expenses[0].total : 0),
        appointments,
        filter: filter || 'all'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get client statistics for specific staff
// @route   GET /api/reports/staff-clients?filter=week|month|year
// @access  Private (STAFF/ADMIN)
const getStaffClientStats = async (req, res) => {
  try {
    const { filter } = req.query;
    const staffId = req.user._id || req.user.id;
    const now = new Date();
    let startDate;

    switch (filter) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // default today
    }

    const query = {
      status: 'COMPLETED',
      appointmentDate: { $gte: startDate }
    };
    if (staffId !== 'SYSTEM_ADMIN_ID') {
      query.staff = staffId;
    }

    const appointments = await Appointment.find(query)
    .populate('customer', 'name phone email visitCount loyaltyPoints')
    .populate('service', 'name price')
    .sort('-appointmentDate');

    // Grouping by customer to count unique clients and their sessions
    const clientMap = new Map();
    appointments.forEach(app => {
      if (!app.customer) return;
      const cid = app.customer._id.toString();
      if (!clientMap.has(cid)) {
        clientMap.set(cid, {
          profile: app.customer,
          sessions: [],
          count: 0
        });
      }
      const data = clientMap.get(cid);
      data.sessions.push({
        date: app.appointmentDate,
        service: app.service?.name,
        price: app.service?.price
      });
      data.count += 1;
    });

    const clientList = Array.from(clientMap.values());

    res.json({
      success: true,
      data: {
        totalUniqueClients: clientList.length,
        totalSessions: appointments.length,
        clients: clientList
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getTopServices, getRevenueByPeriod, getStaffClientStats };
