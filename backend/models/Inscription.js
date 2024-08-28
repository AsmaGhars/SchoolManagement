const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  fees: {
    type: Number,
  },
  isPaid: { 
    type: Boolean, 
    default: false 
  }
});

const Inscription = mongoose.model('Inscription', inscriptionSchema);

module.exports = Inscription;
