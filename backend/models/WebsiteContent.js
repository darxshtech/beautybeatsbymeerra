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
    required: false,
  },
  type: {
    type: String,
    enum: [
      'WELCOME_POPUP', 'HERO_SLIDE', 'GALLERY_IMAGE', 'TESTIMONIAL_IMAGE', 'SERVICE_ICON', 
      'PROMO_BANNER', 'TRANSFORMATION_BEFORE', 'TRANSFORMATION_AFTER', 'WAIT_FREE_GALLERY', 
      'TOUR_VIDEO', 'CUSTOMER_REVIEW',
      'ABOUT_HERO', 'ABOUT_STORY', 'ABOUT_STAT_1', 'ABOUT_STAT_2', 'ABOUT_VALUE', 'ABOUT_TEAM',
      'CONTACT_INFO', 'SERVICES_PAGE_HEADER', 'CONTACT_ADDRESS', 'CONTACT_PHONE', 'CONTACT_EMAIL', 'SOCIAL_INSTAGRAM', 'SOCIAL_FACEBOOK', 'SOCIAL_TIKTOK'
    ],
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
