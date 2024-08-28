const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  recipientModels: [{
    type: String, 
    enum: ['Parent', 'Teacher', 'Student', 'Class'], 
    required: true 
  }],
  recipients: [{ 
    type: Schema.Types.ObjectId, 
    refPath: 'recipientModels',
  }],
  readBy: [{ 
    type: Schema.Types.ObjectId, 
    refPath: 'recipientModels',
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
