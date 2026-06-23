const mongoose = require('mongoose');

const WebsiteContentSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image URL'],
  },
  type: {
    type: String,
    enum: ['WELCOME_POPUP', 'HERO_SLIDE', 'GALLERY_IMAGE', 'TESTIMONIAL_IMAGE', 'SERVICE_ICON', 'PROMO_BANNER', 'TRANSFORMATION_BEFORE', 'TRANSFORMATION_AFTER', 'WAIT_FREE_GALLERY', 'TOUR_VIDEO', 'CUSTOMER_REVIEW'],
    required: [true, 'Please specify content type'],
  },
  branch: {
    type: String,
    enum: ['SALON', 'CLINIC', 'BOTH'],
    required: [true, 'Please specify the branch this content applies to'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WebsiteContent', WebsiteContentSchema);
