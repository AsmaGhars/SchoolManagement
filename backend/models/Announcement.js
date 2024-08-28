const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const announcementSchema = new Schema({
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Announcement', announcementSchema);
