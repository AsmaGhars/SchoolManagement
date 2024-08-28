const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { 
    type: Schema.Types.ObjectId, 
    refPath: 'senderModel', 
    required: true 
  },
  receiver: { 
    type: Schema.Types.ObjectId, 
    refPath: 'receiverModel', 
    required: true 
  },
  senderModel: { 
    type: String, 
    enum: ['Parent', 'Teacher', 'Admin'], 
    required: true 
  },
  receiverModel: { 
    type: String, 
    enum: ['Parent', 'Teacher', 'Admin'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true, 
    minlength: 1, 
    maxlength: 500 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true 
});

messageSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model('Message', messageSchema);
