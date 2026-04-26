const Billing = require('../../models/Billing');
const User = require('../../models/User');
const ErrorResponse = require('../../utils/errorHandler');

class BillingService {
  /**
   * Get all invoices with filtering
   */
  async getInvoices(query) {
    const invoices = await Billing.find(query)
      .populate('customer', 'name phone')
      .sort('-createdAt');

    return {
      success: true,
      count: invoices.length,
      data: invoices
    };
  }

  /**
   * Generate new invoice
   */
  async createInvoice(data) {
    const { customer, items, subtotal, discount, total, paymentMethod, appointment, paymentStatus } = data;

    const invoice = await Billing.create({
      customer,
      items,
      subtotal,
      discount,
      total,
      paymentMethod, // CASH, CARD, UPI, CREDIT
      appointment,
      paymentStatus: paymentStatus || 'PAID'
    });

    // Reward loyalty points (1 point per booking as requested)
    if (paymentStatus === 'PAID') {
      const points = 1;
      User.findByIdAndUpdate(customer, {
        $inc: { loyaltyPoints: points }
      }).catch(err => console.error('Loyalty points update failed:', err));
    }

    return {
      success: true,
      data: invoice
    };
  }

  /**
   * Track / Update payment for credit invoices
   */
  async updatePaymentStatus(id, status) {
    const invoice = await Billing.findById(id);

    if (!invoice) {
       throw new ErrorResponse('Invoice not found', 404);
    }

    invoice.paymentStatus = status;
    const updated = await invoice.save();

    return {
      success: true,
      data: updated
    };
  }
}

module.exports = new BillingService();
