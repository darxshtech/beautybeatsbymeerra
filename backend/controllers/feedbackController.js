const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');

// @desc    Get all feedback (admin)
// @route   GET /api/feedback
// @access  Private/Admin/Staff
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({})
      .populate('customer', 'name email')
      .populate('services', 'name')
      .populate('appointment', 'appointmentDate timeSlot')
      .sort('-createdAt');
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const googleReviews = [
  {
    customer: { name: "Kaajal Noorani" },
    comment: "Excellent place, very relaxing and the services rendered too are very good. Had a hair spa here and Vaishali did a splendid job. Do keep up the good work and all the very best 👍",
    rating: 5,
    service: { name: "Hair Spa" }
  },
  {
    customer: { name: "Nitesh Gaikwad" },
    comment: "Good purse and fashionable accessories. Highly recommend for accessories and quality services.",
    rating: 5,
    service: { name: "Accessories & Styling" }
  },
  {
    customer: { name: "GM Greenhouses" },
    comment: "Truly premium salon and clinic services. Highly professional staff and great experience!",
    rating: 5,
    service: { name: "Premium Service" }
  },
  {
    customer: { name: "Rupesh Singh" },
    comment: "Awesome experience. The staff is very friendly and the service quality is top notch.",
    rating: 5,
    service: { name: "Salon Experience" }
  },
  {
    customer: { name: "Shubham Satkar" },
    comment: "Excellent services and great ambiance. Definitely one of the best salons in the area.",
    rating: 5,
    service: { name: "Grooming & Styling" }
  },
  {
    customer: { name: "Savita Santosh Tamboli" },
    comment: "Highly recommended salon. Professional services, clean environment, and wonderful staff.",
    rating: 5,
    service: { name: "Premium Care" }
  }
];

// @desc    Get approved public reviews (positive only, rating >= 4)
// @route   GET /api/feedback/public
// @access  Public
const getPublicFeedback = async (req, res) => {
  try {
    res.json({ success: true, data: googleReviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add feedback (from review link)
// @route   POST /api/feedback
// @access  Public (via appointment ID)
const addFeedback = async (req, res) => {
  const { appointment, rating, comment } = req.body;

  try {
    // Look up the appointment to get customer and service
    const app = await Appointment.findById(appointment).populate('services', 'name');
    if (!app) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if feedback already exists for this appointment
    const existing = await Feedback.findOne({ appointment });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Review already submitted for this appointment' });
    }

    const feedback = new Feedback({
      appointment,
      customer: app.customer,
      service: app.service?._id,
      rating,
      comment,
      isApproved: false // Needs admin moderation
    });

    const created = await feedback.save();
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Approve a review
// @route   PUT /api/feedback/:id/approve
// @access  Private/Admin
const approveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject/remove approval
// @route   PUT /api/feedback/:id/reject
// @access  Private/Admin
const rejectFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFeedback, getPublicFeedback, addFeedback, approveFeedback, rejectFeedback };
