const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subName: {
    type: String,
    required: [true, "Le nom du sujet est obligatoire"],
    trim: true
  },
  coefficient: {
    type: Number,
    required: [true, "Le coefficient est obligatoire"],
    min: [1, "Le coefficient ne peut pas être ni nul ninégatif"]
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
}
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
