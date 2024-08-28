const mongoose = require('mongoose');

const AttendanceReportSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  totalAbsences: {
    type: Number,
    default: 0
  },
  totalPresences: {
    type: Number,
    default: 0
  },
  totalLate: {
    type: Number,
    default: 0
  },
  reportDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AttendanceReport = mongoose.model('AttendanceReport', AttendanceReportSchema);

module.exports = AttendanceReport;
