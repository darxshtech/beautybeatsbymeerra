const ConsentForm = require('../models/ConsentForm');
const Appointment = require('../models/Appointment');
const AdminNotification = require('../models/AdminNotification');
const User = require('../models/User');

/**
 * @desc    Create consent form and start service
 * @route   POST /api/consent-forms
 * @access  Private (STAFF/ADMIN)
 */
exports.createConsentForm = async (req, res, next) => {
  try {
    const {
      appointmentId,
      customerName,
      customerAge,
      customerPhone,
      skinType,
      allergies,
      medicalConditions,
      treatmentType,
      serviceRequested,
      specialInstructions,
      digitalSignature
    } = req.body;

    const employeeId = req.user._id || req.user.id;

    // Validate appointment exists
    const appointment = await Appointment.findById(appointmentId)
      .populate('customer', 'name phone')
      .populate('service', 'name')
      .populate('staff', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Create consent form
    const consentForm = await ConsentForm.create({
      appointment: appointmentId,
      customer: appointment.customer._id,
      employee: employeeId,
      customerName,
      customerAge,
      customerPhone,
      skinType,
      allergies,
      medicalConditions,
      treatmentType,
      serviceRequested,
      specialInstructions,
      digitalSignature,
      consentGiven: true
    });

    // Update appointment status to IN_PROGRESS and assign staff
    appointment.status = 'IN_PROGRESS';
    if (!appointment.staff) {
      appointment.staff = employeeId;
    }
    await appointment.save();

    // Notify admin: consent form done + employee attending
    const employee = await User.findById(employeeId);
    await AdminNotification.create({
      type: 'CONSENT_FORM_DONE',
      title: '📋 Consent Form Completed',
      message: `${employee?.name || 'Staff'} has completed the consent form for ${customerName}. Now attending service: ${serviceRequested}.`,
      employee: employeeId,
      customer: appointment.customer._id,
      appointment: appointmentId
    });

    await AdminNotification.create({
      type: 'SERVICE_STARTED',
      title: '🔄 Service In Progress',
      message: `${employee?.name || 'Staff'} is now attending ${customerName} for ${serviceRequested}.`,
      employee: employeeId,
      customer: appointment.customer._id,
      appointment: appointmentId
    });

    res.status(201).json({ success: true, data: consentForm });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get consent form by appointment ID
 * @route   GET /api/consent-forms/appointment/:appointmentId
 * @access  Private (STAFF/ADMIN)
 */
exports.getByAppointment = async (req, res, next) => {
  try {
    const form = await ConsentForm.findOne({ appointment: req.params.appointmentId })
      .populate('customer', 'name phone email')
      .populate('employee', 'name');
    
    res.status(200).json({ success: true, data: form });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all consent forms
 * @route   GET /api/consent-forms
 * @access  Private (ADMIN)
 */
exports.getAllConsentForms = async (req, res, next) => {
  try {
    const forms = await ConsentForm.find()
      .populate('customer', 'name phone')
      .populate('employee', 'name')
      .populate('appointment')
      .sort('-createdAt')
      .limit(50);
    
    res.status(200).json({ success: true, data: forms });
  } catch (err) {
    next(err);
  }
};
