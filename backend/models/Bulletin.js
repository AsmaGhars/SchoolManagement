const mongoose = require('mongoose');

const bulletinSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  trimester: {
    type: String,
    required: true
  },
  subjects: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    controleGrade: {
      type: Number
    },
    syntheseGrade: {
      type: Number
    },
    coefficient: {
      type: Number
    }
  }],
  average: { type: Number, default: null },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
});

const Bulletin = mongoose.model("Bulletin", bulletinSchema);

module.exports = Bulletin;
