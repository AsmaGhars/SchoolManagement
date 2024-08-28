const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  schedule: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      weekday: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true,
      },
      startHour: {
        type: String,
        required: true,
      },
      endHour: {
        type: String,
        required: true,
      },
    },
  ]
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
