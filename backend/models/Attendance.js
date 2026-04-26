const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format for easy querying
  clockIn: { type: Date, required: true },
  clockOut: { type: Date },
  totalHours: { type: Number }, // Calculated on clock-out
  status: { 
    type: String, 
    enum: ['CLOCKED_IN', 'CLOCKED_OUT'], 
    default: 'CLOCKED_IN' 
  },
  notes: { type: String },
  ipAddress: { type: String },
  deviceName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Compound index: one active attendance log per employee per day
AttendanceSchema.index({ employee: 1, date: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
