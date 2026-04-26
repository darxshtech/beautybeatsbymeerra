const mongoose = require('mongoose');

const ConsentFormSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Customer Details (captured at time of consent)
  customerName: { type: String, required: true },
  customerAge: { type: Number },
  customerPhone: { type: String },
  
  // Skin & Health Info
  skinType: { 
    type: String, 
    enum: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Other'],
    default: 'Normal'
  },
  allergies: { type: String, default: 'None' },
  medicalConditions: { type: String, default: 'None' },
  
  // Treatment Details
  treatmentType: { type: String, required: true },
  serviceRequested: { type: String, required: true },
  specialInstructions: { type: String },
  
  // Digital Signature (base64 data URL)
  digitalSignature: { type: String, required: true },
  
  // Consent Acknowledgement
  consentText: { 
    type: String, 
    default: 'I hereby confirm that all the information provided above is accurate to the best of my knowledge. I consent to the treatment/service and understand the potential risks involved. I have disclosed all relevant allergies and medical conditions.'
  },
  consentGiven: { type: Boolean, required: true, default: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConsentForm', ConsentFormSchema);
