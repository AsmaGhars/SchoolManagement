const mongoose = require('mongoose');

const AbsenceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Absent' 
  }
}, {
  timestamps: true 
});

const Absence = mongoose.model('Absence', AbsenceSchema);

module.exports = Absence;
