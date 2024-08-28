const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  trimester: {
    type: String,
    enum: ["Trimester 1", "Trimester 2", "Trimester 3"],
    required: true,
  },
  controleGrade: {
    type: Number,
    min: 0,
    max: 20,
  },
  syntheseGrade: {
    type: Number,
    min: 0,
    max: 20,
  },
});

module.exports = mongoose.model("Grade", gradeSchema);
