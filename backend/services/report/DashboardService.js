const Appointment = require('../../models/Appointment');
const User = require('../../models/User');
const Billing = require('../../models/Billing');

class DashboardService {
  /**
   * Get main KPIs and notifications for dashboard
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);

    // 1. KPIs
    const appointmentsTodayCount = await Appointment.countDocuments({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: { $ne: 'CANCELLED' }
    });

    const revenueStats = await Billing.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    const activeCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // 2. Upcoming Schedule (Today and onwards, next 5)
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gte: today },
      status: { $in: ['PENDING', 'CONFIRMED', 'IN-PROGRESS'] }
    })
    .sort({ appointmentDate: 1, timeSlot: 1 })
    .limit(5)
    .populate('customer', 'name phone')
    .populate('service', 'name');

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

    // Pending Payments
    const pendingBillings = await Billing.find({
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

    return {
      success: true,
      data: {
        kpis: {
          totalRevenue,
          appointmentsToday: appointmentsTodayCount,
          activeCustomers
        },
        upcomingAppointments: upcomingAppointments.map(app => ({
          id: app._id,
          customer: app.customer?.name || 'Guest',
          service: app.service?.name || 'Service',
          time: app.timeSlot,
          status: app.status === 'IN-PROGRESS' ? 'In-Progress' : (app.status === 'PENDING' ? 'Booked' : app.status),
          statusRaw: app.status
        })),
        notifications: notifications.sort((a, b) => (a.severity === 'URGENT' ? -1 : 1))
      }
    };
  }
}

module.exports = new DashboardService();
