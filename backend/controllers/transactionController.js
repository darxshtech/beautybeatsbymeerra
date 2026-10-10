const AccountTransaction = require('../models/AccountTransaction');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');

// @desc    Get all transactions with filtering & tags
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    const { search, tag, status, startDate, endDate } = req.query;
    const query = {};

    if (tag && tag !== 'ALL') {
      query.tag = tag;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { referenceId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { utrNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await AccountTransaction.find(query)
      .populate('appointment')
      .populate('billing')
      .sort({ createdAt: -1 })
      .limit(100);

    // Summary stats
    const totalVolume = await AccountTransaction.aggregate([
      { $match: { status: { $in: ['RECEIVED', 'MATCHED'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const upiVolume = await AccountTransaction.aggregate([
      { $match: { paymentMethod: 'UPI', status: { $in: ['RECEIVED', 'MATCHED'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      stats: {
        totalVolume: totalVolume[0]?.total || 0,
        upiVolume: upiVolume[0]?.total || 0,
        count: transactions.length
      }
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ success: false, message: 'Server error fetching transactions' });
  }
};

// @desc    Sync/Record live account transaction (Admin or system webhook)
// @route   POST /api/transactions/sync
exports.syncTransaction = async (req, res) => {
  try {
    const { referenceId, amount, paymentMethod, tag, status, customerName, customerPhone, utrNumber, notes } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const ref = referenceId || `TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = await AccountTransaction.create({
      referenceId: ref,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'UPI',
      tag: tag || 'CLIENT_WEBSITE_BOOKING',
      status: status || 'RECEIVED',
      customerName,
      customerPhone,
      utrNumber,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Transaction synced successfully',
      data: transaction
    });
  } catch (err) {
    console.error('Error syncing transaction:', err);
    res.status(500).json({ success: false, message: 'Error syncing transaction' });
  }
};

// @desc    Check if payment matches referenceId or amount within 5 minutes
// @route   GET /api/transactions/check-match
exports.checkPaymentMatch = async (req, res) => {
  try {
    const { referenceId, amount } = req.query;

    if (!referenceId && !amount) {
      return res.status(400).json({ success: false, message: 'referenceId or amount is required' });
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // 1. Direct reference match
    let match = null;
    if (referenceId) {
      match = await AccountTransaction.findOne({
        referenceId: referenceId,
        status: { $in: ['RECEIVED', 'MATCHED'] }
      });
    }

    // 2. Amount + recent timestamp match (within last 5 minutes)
    if (!match && amount) {
      match = await AccountTransaction.findOne({
        amount: Number(amount),
        status: 'RECEIVED',
        createdAt: { $gte: fiveMinutesAgo }
      }).sort({ createdAt: -1 });
    }

    if (match) {
      // Mark as matched
      match.status = 'MATCHED';
      if (referenceId && match.referenceId !== referenceId && match.referenceId.startsWith('TXN-')) {
        match.referenceId = referenceId;
      }
      await match.save();

      return res.status(200).json({
        success: true,
        matched: true,
        data: match
      });
    }

    return res.status(200).json({
      success: true,
      matched: false,
      message: 'No matching transaction detected yet'
    });
  } catch (err) {
    console.error('Error checking payment match:', err);
    res.status(500).json({ success: false, message: 'Server error checking payment' });
  }
};

// @desc    Live Bank SMS / App Notification Webhook Listener (Automated Zero-Gateway Sync)
// @route   POST /api/transactions/webhook/bank-sms
exports.receiveBankSmsWebhook = async (req, res) => {
  try {
    const rawMessage = req.body.message || req.body.body || req.body.text || req.body.sms || (typeof req.body === 'string' ? req.body : '');
    const providedSecret = req.headers['x-webhook-secret'] || req.query.secret || req.body.secret;
    
    // Check webhook secret if configured in salon settings
    const SalonSettings = require('../models/SalonSettings');
    const settings = await SalonSettings.findOne({ branch: 'SALON' });
    if (settings?.bankDetails?.webhookSecret && providedSecret && settings.bankDetails.webhookSecret !== providedSecret) {
      return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
    }

    let amount = Number(req.body.amount);
    let utrNumber = req.body.utrNumber || req.body.utr;
    let orderRef = req.body.referenceId || req.body.ref;

    // Regex extraction from raw bank SMS if not provided directly
    if (rawMessage) {
      // 1. Extract Amount: e.g. "credited with INR 500.00" or "Rs.500" or "INR 500"
      if (!amount || isNaN(amount)) {
        const amtMatch = rawMessage.match(/(?:INR|Rs\.?|INR\s*|Rs\s*)[:\s]*([0-9]+(?:\.[0-9]{1,2})?)/i) ||
                         rawMessage.match(/credited\s*(?:with|by)?\s*(?:INR|Rs\.?)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
        if (amtMatch) {
          amount = parseFloat(amtMatch[1]);
        }
      }

      // 2. Extract 12-digit UTR
      if (!utrNumber) {
        const utrMatch = rawMessage.match(/(?:UPI\/|Ref\s*(?:No\.?)?[:\s]*|UTR\s*[:\s]*|UPI\s*Ref[:\s]*)([0-9]{12})/i) ||
                         rawMessage.match(/\b([0-9]{12})\b/);
        if (utrMatch) {
          utrNumber = utrMatch[1];
        }
      }

      // 3. Extract Order Reference if present in remarks: e.g. "BB-123456-7890"
      if (!orderRef) {
        const refMatch = rawMessage.match(/\b(BB-[0-9]{6}-[0-9]{4})\b/i);
        if (refMatch) {
          orderRef = refMatch[1];
        }
      }
    }

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Could not detect credit amount from message or payload' });
    }

    // Verify if UTR or Ref already exists to prevent duplicate credits
    let existing = null;
    if (utrNumber) {
      existing = await AccountTransaction.findOne({ utrNumber });
    }
    if (!existing && orderRef) {
      existing = await AccountTransaction.findOne({ referenceId: orderRef });
    }

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Transaction already logged',
        data: existing
      });
    }

    const ref = orderRef || `TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = await AccountTransaction.create({
      referenceId: ref,
      amount: Number(amount),
      paymentMethod: 'UPI',
      tag: 'CLIENT_WEBSITE_BOOKING',
      status: 'RECEIVED',
      utrNumber: utrNumber || `UTR-${Date.now().toString().slice(-8)}`,
      notes: rawMessage ? `Bank SMS / Live Alert: ${rawMessage.slice(0, 200)}` : 'Live webhook notification',
      customerName: req.body.customerName || 'Direct UPI Payer'
    });

    console.log(`[BANK WEBHOOK] Successfully logged ₹${amount} credit! Ref: ${ref}, UTR: ${utrNumber}`);

    return res.status(201).json({
      success: true,
      message: 'Live bank transaction logged and available for instant auto-matching',
      data: transaction
    });
  } catch (err) {
    console.error('Error handling bank SMS webhook:', err);
    res.status(500).json({ success: false, message: 'Server error processing bank webhook' });
  }
};

// @desc    Customer self-confirmation / UTR verification
// @route   POST /api/transactions/verify-customer-utr
exports.verifyCustomerUtr = async (req, res) => {
  try {
    const { referenceId, amount, utrNumber, customerName, customerPhone } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const ref = referenceId || `REF-${Date.now().toString().slice(-6)}`;

    // Create or update transaction as MATCHED
    let transaction = await AccountTransaction.findOne({ referenceId: ref });
    if (!transaction) {
      transaction = await AccountTransaction.create({
        referenceId: ref,
        amount: Number(amount),
        paymentMethod: 'UPI',
        tag: 'CLIENT_WEBSITE_BOOKING',
        status: 'MATCHED',
        customerName: customerName || 'Online Client',
        customerPhone,
        utrNumber: utrNumber || `UTR-${Date.now().toString().slice(-8)}`
      });
    } else {
      transaction.status = 'MATCHED';
      if (utrNumber) transaction.utrNumber = utrNumber;
      await transaction.save();
    }

    res.status(200).json({
      success: true,
      matched: true,
      data: transaction
    });
  } catch (err) {
    console.error('Error verifying customer UTR:', err);
    res.status(500).json({ success: false, message: 'Error verifying UTR' });
  }
};
