const MessageTemplate = require('../models/MessageTemplate');

// @desc    Get all message templates
// @route   GET /api/message-templates
// @access  Private/Admin
const getTemplates = async (req, res) => {
  try {
    // Seed defaults if empty
    await MessageTemplate.seedDefaults();
    const templates = await MessageTemplate.find({});
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a message template
// @route   PUT /api/message-templates/:key
// @access  Private/Admin
const updateTemplate = async (req, res) => {
  try {
    const { messageBody, discountPercent, isActive } = req.body;
    const template = await MessageTemplate.findOneAndUpdate(
      { key: req.params.key },
      { messageBody, discountPercent, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTemplates, updateTemplate };
