const mongoose = require('mongoose');

const performanceReportSchema = new mongoose.Schema({
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
  finalAverage: {
    type: Number,
    required: true
  },
  passedSubjects: {
    type: Number,
    required: true
  },
  failedSubjects: {
    type: Number,
    required: true
  },
  totalSubjects: {
    type: Number,
    required: true
  },
  trimesters: [
    {
      trimester: {
        type: String,
        required: true
      },
      average: {
        type: Number,
        required: true
      }
    }
  ],
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PerformanceReport', performanceReportSchema);
