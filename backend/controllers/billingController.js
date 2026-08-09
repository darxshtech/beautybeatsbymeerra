const BillingService = require('../services/billing/BillingService');
const Billing = require('../models/Billing');

/**
 * @desc    Get all bills (with search and customer filter)
 * @route   GET /api/billing
 * @access  Private/Admin/Staff
 */
exports.getBills = async (req, res, next) => {
  try {
    const { search, customer } = req.query;
    let filter = { branch: req.branch };

    if (customer) {
      filter.customer = customer;
    }

    let bills = await Billing.find(filter)
      .populate('customer', 'name phone email loyaltyPoints visitCount')
      .populate({
        path: 'appointment',
        populate: [
          { path: 'services', select: 'name category price duration' },
          { path: 'staff', select: 'name' }
        ]
      })
      .sort('-createdAt');

    // Search filter (by customer name or invoice ID)
    if (search) {
      const s = search.toLowerCase();
      bills = bills.filter(b => 
        (b.customer?.name || '').toLowerCase().includes(s) ||
        (b._id.toString()).includes(s)
      );
    }

    res.status(200).json({ success: true, count: bills.length, data: bills });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get bill by ID
 * @route   GET /api/billing/:id
 * @access  Private
 */
exports.getBillById = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('customer', 'name phone email address')
      .populate({
        path: 'appointment',
        populate: [
          { path: 'services', select: 'name category price duration' },
          { path: 'staff', select: 'name' }
        ]
      });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.status(200).json({ success: true, data: bill });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a bill
 * @route   POST /api/billing
 * @access  Private/Admin/Staff
 */
exports.createBill = async (req, res, next) => {
  try {
    const response = await BillingService.createInvoice(req.body);
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update bill status
 * @route   PUT /api/billing/:id/status
 * @access  Private/Admin
 */
exports.updateBillStatus = async (req, res, next) => {
  try {
    const response = await BillingService.updatePaymentStatus(req.params.id, req.body.status);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Send bill to customer & admin via WhatsApp (wa.me manual links)
 * @route   POST /api/billing/:id/send
 * @access  Private/Admin/Staff
 */
exports.sendBillWhatsApp = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate({
        path: 'appointment',
        populate: { path: 'services', select: 'name price' }
      });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const phone = bill.customer?.phone;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Customer phone not found' });
    }

    let invoiceUrl = bill.invoiceUrl || null;

    // 1. Generate & Upload PDF Invoice to Cloudinary
    try {
      const InvoicePdfService = require('../services/notification/InvoicePdfService');
      invoiceUrl = await InvoicePdfService.generateAndUploadInvoice(bill);
      bill.invoiceUrl = invoiceUrl;
      await bill.save();
    } catch (pdfErr) {
      console.error('[BILLING] PDF/Cloudinary Upload failed:', pdfErr.message);
    }

    // Fallback: use direct backend PDF route
    if (!invoiceUrl) {
      invoiceUrl = `${process.env.SERVER_URL || 'https://beautybeatsbymeerra-bdk7.onrender.com'}/api/billing/${bill._id}/pdf`;
      bill.invoiceUrl = invoiceUrl;
      await bill.save().catch(() => {});
    }

    // 2. Build WhatsApp message with PDF link
    const brandName = bill.branch === 'CLINIC' ? 'BeautyBeats Clinic' : 'BeautyBeats';
    const clientWebsiteUrl = bill.branch === 'CLINIC' 
      ? (process.env.CLINIC_WEBSITE_URL || 'https://beautybeatsbymeerra.vercel.app/')
      : (process.env.CLIENT_WEBSITE_URL || 'https://beautybeatsbymeerra.vercel.app/');

    const itemsList = (bill.items || []).map(i => `• ${i.name} — ₹${i.price}`).join('\n');
    const msg = [
      `🧾 *${brandName} Official Invoice*`,
      ``,
      `Hi ${bill.customer?.name || 'Customer'},`,
      `Thank you for visiting ${brandName}!`,
      itemsList ? `\n*Services / Items:*\n${itemsList}` : '',
      `\n*Total Paid:* ₹${bill.total}`,
      `*Payment:* ${bill.paymentMethod || 'CASH'}`,
      ``,
      `📄 *Download Detailed PDF Invoice:*`,
      `${invoiceUrl}`,
      ``,
      `🌐 *Visit Our Salon Website & Book Appointments:*`,
      `${clientWebsiteUrl}`,
      ``,
      `⭐ Thank you for choosing ${brandName}! See you soon.`,
    ].filter(Boolean).join('\n');

    // 3. Build wa.me URL for customer
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const customerWhatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;

    // 4. Build wa.me URL for admin
    let adminWhatsappUrl = null;
    const adminPhone = process.env.ADMIN_PHONE;
    if (adminPhone) {
      const cleanAdminPhone = adminPhone.replace(/\D/g, '').slice(-10);
      const adminMsg = [
        `🧾 *${brandName} — Admin Invoice Copy*`,
        ``,
        `Customer: *${bill.customer?.name || 'Customer'}* (${phone})`,
        itemsList ? `\n*Services / Items:*\n${itemsList}` : '',
        `\n*Total:* ₹${bill.total}`,
        `*Payment:* ${bill.paymentMethod || 'CASH'}`,
        ``,
        `📄 *PDF Invoice:*`,
        `${invoiceUrl}`,
      ].filter(Boolean).join('\n');
      adminWhatsappUrl = `https://wa.me/91${cleanAdminPhone}?text=${encodeURIComponent(adminMsg)}`;
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Invoice ready. Send to customer & admin via WhatsApp.',
      customerWhatsappUrl,
      adminWhatsappUrl,
      invoiceUrl,
      formattedMessage: msg
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Generate and stream single Bill PDF Invoice directly
 * @route   GET /api/billing/:id/pdf
 * @access  Public / Tokenized
 */
exports.generateSingleBillPDF = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('customer', 'name phone')
      .populate({
        path: 'appointment',
        populate: { path: 'services', select: 'name price' }
      });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const InvoicePdfService = require('../services/notification/InvoicePdfService');
    const pdfBuffer = await InvoicePdfService.generateInvoicePDFBuffer(bill);

    const invId = bill._id.toString().substring(0, 8).toUpperCase();
    const filename = `BeautyBeats_Invoice_INV-${invId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Generate Full Billing History PDF for a customer
 * @route   GET /api/billing/customer/:id/pdf
 * @access  Private/Admin/Staff
 */
exports.generateCustomerHistoryPDF = async (req, res, next) => {
  try {
    const PDFDocument = require('pdfkit');
    const User = require('../models/User');
    
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const bills = await Billing.find({ customer: req.params.id })
      .populate({
        path: 'appointment',
        populate: { path: 'services', select: 'name price' }
      })
      .sort('createdAt');

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BeautyBeats_History_${customer.name.replace(/\s/g, '_')}.pdf`);

    doc.pipe(res);

    // Header
    const brandName = req.branch === 'CLINIC' ? 'BEAUTYBEATS CLINIC' : 'BEAUTYBEATS';
    doc.fillColor('#FF3B30').fontSize(24).text(brandName, { align: 'center', weight: 900 });
    doc.fillColor('#444444').fontSize(10).text('Premium Salon & Clinic Management', { align: 'center' }).moveDown(2);

    // Customer Info
    doc.fillColor('#000000').fontSize(16).text('Customer Billing Statement', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Name: ${customer.name}`);
    doc.text(`Phone: ${customer.phone || 'N/A'}`);
    doc.text(`Total Visits: ${customer.visitCount || 0}`);
    doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN')}`);
    doc.moveDown(2);

    // Table Header
    const tableTop = 250;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', 50, tableTop);
    doc.text('Invoice ID', 130, tableTop);
    doc.text('Service/Item', 210, tableTop);
    doc.text('Method', 400, tableTop);
    doc.text('Amount', 480, tableTop, { align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.font('Helvetica');

    let y = tableTop + 25;
    let grandTotal = 0;

    bills.forEach(bill => {
      const serviceName = bill.appointment?.service?.name || bill.items?.[0]?.name || 'N/A';
      const dateStr = new Date(bill.createdAt).toLocaleDateString('en-IN');
      const invId = bill._id.toString().substring(0, 8).toUpperCase();
      
      doc.fontSize(9);
      doc.text(dateStr, 50, y);
      doc.text(`INV-${invId}`, 130, y);
      doc.text(serviceName, 210, y, { width: 180 });
      doc.text(bill.paymentMethod, 400, y);
      doc.text(`₹${bill.total}`, 480, y, { align: 'right' });

      grandTotal += bill.total;
      y += 20;

      // New page if needed
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica-Bold').text(`Total Business Value: ₹${grandTotal}`, { align: 'right' });

    // Footer
    const brandFooterName = req.branch === 'CLINIC' ? 'BeautyBeats Clinic' : 'BeautyBeats';
    doc.fontSize(8).font('Helvetica').fillColor('#888888').text(`Thank you for being a loyal customer at ${brandFooterName}!`, 50, doc.page.height - 50, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ success: false, message: 'Could not generate PDF' });
  }
};
