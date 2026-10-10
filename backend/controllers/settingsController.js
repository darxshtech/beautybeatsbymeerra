const SalonSettings = require('../models/SalonSettings');

// Helper to get or initialize default settings
const getOrCreateDefaultSettings = async (branch = 'SALON') => {
  let settings = await SalonSettings.findOne({ branch });
  if (!settings) {
    settings = await SalonSettings.create({
      branch,
      openingTime: '10:00 AM',
      closingTime: '08:00 PM',
      slotInterval: 30,
      closedDays: [],
      isClosedTodayOverride: false
    });
  }
  return settings;
};

// @desc    Get salon settings (Public)
// @route   GET /api/settings/salon
exports.getSalonSettings = async (req, res) => {
  try {
    const branch = req.query.branch || req.branch || 'SALON';
    const settings = await getOrCreateDefaultSettings(branch);
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (err) {
    console.error('Error fetching salon settings:', err);
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
};

// @desc    Update salon settings (Admin only)
// @route   PUT /api/settings/salon
exports.updateSalonSettings = async (req, res) => {
  try {
    const branch = req.body.branch || req.branch || 'SALON';
    const { openingTime, closingTime, slotInterval, closedDays, isClosedTodayOverride, bankDetails } = req.body;

    let settings = await SalonSettings.findOne({ branch });
    if (!settings) {
      settings = new SalonSettings({ branch });
    }

    if (openingTime) settings.openingTime = openingTime;
    if (closingTime) settings.closingTime = closingTime;
    if (slotInterval !== undefined) settings.slotInterval = Number(slotInterval);
    if (Array.isArray(closedDays)) settings.closedDays = closedDays;
    if (typeof isClosedTodayOverride === 'boolean') settings.isClosedTodayOverride = isClosedTodayOverride;
    if (bankDetails && typeof bankDetails === 'object') {
      settings.bankDetails = {
        ...(settings.bankDetails?.toObject ? settings.bankDetails.toObject() : settings.bankDetails),
        ...bankDetails
      };
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Salon settings updated successfully',
      data: settings
    });
  } catch (err) {
    console.error('Error updating salon settings:', err);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};
