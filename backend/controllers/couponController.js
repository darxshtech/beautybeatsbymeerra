const Coupon = require('../models/Coupon');
const crypto = require('crypto');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin/Staff
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).populate('assignedTo', 'name phone').sort('-createdAt');
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate + get coupon by code (for client booking page)
// @route   GET /api/coupons/validate/:code
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found or inactive' });
    }
    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.isUsed) {
      return res.status(400).json({ success: false, message: 'Coupon has already been used' });
    }

    res.json({ 
      success: true, 
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        eventType: coupon.eventType,
        assignedTo: coupon.assignedTo
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auto-generate a unique coupon for a customer
// @route   POST /api/coupons/generate
// @access  Private/Admin (or internal service call)
const generateCoupon = async (req, res) => {
  try {
    const { customerId, eventType, discountPercent } = req.body;
    
    // Generate unique code: BB-BDAY-XXXX or BB-ANNIV-XXXX
    const prefix = eventType ? eventType.substring(0, 4).toUpperCase() : 'PROMO';
    const unique = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `BB-${prefix}-${unique}`;
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // Valid for 30 days

    const coupon = await Coupon.create({
      code,
      description: `${eventType || 'Special'} discount for customer`,
      discountType: 'PERCENTAGE',
      discountValue: discountPercent || 20,
      expiryDate: expiry,
      usageLimit: 1,
      assignedTo: customerId,
      eventType: eventType || 'Promo',
      isActive: true
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Helper function for internal use (not an API endpoint)
const generateCouponInternal = async (customerId, eventType, discountPercent) => {
  const prefix = eventType ? eventType.substring(0, 4).toUpperCase() : 'PROMO';
  const unique = crypto.randomBytes(3).toString('hex').toUpperCase();
  const code = `BB-${prefix}-${unique}`;
  
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  const coupon = await Coupon.create({
    code,
    description: `${eventType || 'Special'} discount`,
    discountType: 'PERCENTAGE',
    discountValue: discountPercent || 20,
    expiryDate: expiry,
    usageLimit: 1,
    assignedTo: customerId,
    eventType: eventType || 'Promo',
    isActive: true
  });

  return coupon;
};

// @desc    Create a coupon manually
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    const created = await coupon.save();
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
      await coupon.deleteOne();
      res.json({ success: true, message: 'Coupon removed' });
    } else {
      res.status(404).json({ success: false, message: 'Coupon not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark coupon as used
const markCouponUsed = async (code) => {
  await Coupon.findOneAndUpdate({ code: code.toUpperCase() }, { isUsed: true, usedCount: 1 });
};

module.exports = { getCoupons, validateCoupon, generateCoupon, generateCouponInternal, createCoupon, deleteCoupon, markCouponUsed };
