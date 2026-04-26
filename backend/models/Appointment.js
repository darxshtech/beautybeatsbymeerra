const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional preferred staff
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'IN-PROGRESS', 'COMPLETED', 'CANCELLED', 'NOSHOW'], 
    default: 'PENDING' 
  },
  type: {
    type: String,
    enum: ['ONLINE', 'WALKIN'],
    default: 'ONLINE'
  },
  notes: { type: String },
  couponCode: { type: String },
  consultantNotes: { type: String }, // For skin tone details/suggestions
  
  billing: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
