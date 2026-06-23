const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const Billing = require('../../models/Billing');

class DashboardService {
  /**
   * Get main KPIs and notifications for dashboard
   */
  async getDashboardStats(branch = 'SALON') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);

    // 1. KPIs filtered by branch
    const appointmentsTodayCount = await Appointment.countDocuments({
      branch,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $ne: 'CANCELLED' }
    });

    const revenueStats = await Billing.aggregate([
      { $match: { branch } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    // Cash Revenue
    const cashStats = await Billing.aggregate([
      { $match: { branch, paymentMethod: 'CASH', paymentStatus: 'PAID' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    const totalCashRevenue = cashStats.length > 0 ? cashStats[0].total : 0;

    // Prepaid Revenue (CARD or UPI)
    const prepaidStats = await Billing.aggregate([
      { $match: { branch, paymentMethod: { $in: ['CARD', 'UPI'] }, paymentStatus: 'PAID' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    const totalPrepaidRevenue = prepaidStats.length > 0 ? prepaidStats[0].total : 0;

    // Active customers (global but can filter if needed; keep it simple)
    const activeCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // 2. Upcoming Schedule (Today and onwards, next 5) filtered by branch
    const upcomingAppointments = await Appointment.find({
      branch,
      appointmentDate: { $gte: today },
      status: { $in: ['PENDING', 'CONFIRMED', 'IN-PROGRESS'] }
    })
    .sort({ appointmentDate: 1, timeSlot: 1 })
    .limit(5)
    .populate('customer', 'name phone')
    .populate('services', 'name');

    // 3. Notifications/Action Required
    const notifications = [];

    // Local timezone-aware today
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();

    // Special Event Alerts (Birthday - today)
    const birthdayUsers = await User.find({
      role: 'CUSTOMER',
      birthday: { $exists: true, $ne: null }
    }).select('name birthday phone');

    birthdayUsers.forEach(user => {
      if (!user.birthday) return;
      const bday = new Date(user.birthday);
      const isToday = bday.getDate() === todayDay && bday.getMonth() === todayMonth;
      if (isToday) {
        notifications.push({
          type: 'SPECIAL_EVENT',
          title: 'BIRTHDAY TODAY', 
          message: `${user.name}'s birthday is today. Send a discount coupon!`,
          severity: 'URGENT',
          action: 'SEND_DISCOUNT',
          metadata: { userId: user._id, eventType: 'Birthday', phone: user.phone },
          phone: user.phone
        });
      }
    });

    // Pending Payments filtered by branch
    const pendingBillings = await Billing.find({
      branch,
      paymentStatus: 'PENDING'
    }).populate('customer', 'name phone').limit(5);

    pendingBillings.forEach(bill => {
      notifications.push({
        type: 'PAYMENT',
        title: 'PENDING PAYMENT',
        message: `Invoice for ${bill.customer?.name || 'Customer'} is overdue. Send reminder?`,
        severity: 'MEDIUM',
        action: 'SEND_REMINDER',
        metadata: { billId: bill._id, phone: bill.customer?.phone },
        phone: bill.customer?.phone
      });
    });
    // 4. Recent Transactions
    const recentBillings = await Billing.find({ branch })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name');

    return {
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalCashRevenue,
          totalPrepaidRevenue,
          appointmentsToday: appointmentsTodayCount,
          activeCustomers
        },
        upcomingAppointments: upcomingAppointments.map(app => ({
          id: app._id,
          customer: app.customer?.name || 'Guest',
          service: app.services?.map(s => s.name).join(', ') || 'Service',
          time: app.timeSlot,
          status: app.status === 'IN-PROGRESS' ? 'In-Progress' : (app.status === 'PENDING' ? 'Booked' : app.status),
          statusRaw: app.status
        })),
        recentTransactions: recentBillings.map(bill => ({
          id: bill._id,
          customer: bill.customer?.name || 'Guest',
          amount: bill.total,
          method: bill.paymentMethod || 'CASH',
          status: bill.paymentStatus
        })),
        notifications: notifications.sort((a, b) => (a.severity === 'URGENT' ? -1 : 1))
      }
    };
  }
}

module.exports = new DashboardService();
