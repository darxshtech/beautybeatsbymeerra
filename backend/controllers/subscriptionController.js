const SubscriptionPlan = require('../models/SubscriptionPlan');

exports.getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort('price');
    
    // Seed default plans if none exist
    if (plans.length === 0) {
      const defaultPlans = [
        { name: 'Basic Plan', code: 'BASIC', price: '₹999', interval: 'monthly', popular: false, color: 'from-pink-400 to-rose-400', features: ['1 Essential haircut per month', '10% off beauty products', 'Priority booking support', 'Birthday month surprise'] },
        { name: 'Premium Plan', code: 'PREMIUM', price: '₹1999', interval: 'monthly', popular: true, color: 'from-primary to-rose-600', features: ['2 Premium styling sessions', '1 Monthly luxury facial', '20% off all retail products', 'Free beverages during visits', 'Dedicated styling consultant'] },
        { name: 'VIP Gold', code: 'VIP', price: '₹3999', interval: 'monthly', popular: false, color: 'from-amber-400 to-orange-500', features: ['Unlimited styling adjustments', '2 Full pamper packages per month', '30% off all retail products', 'Private suite access', 'Complimentary valet parking', 'VIP Event Invitations'] }
      ];
      await SubscriptionPlan.insertMany(defaultPlans);
      return res.status(200).json({ success: true, data: defaultPlans });
    }

    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};
