const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  announcement: {
    type: Schema.Types.ObjectId,
    ref: 'Announcement',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
