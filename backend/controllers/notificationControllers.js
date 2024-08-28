const Notification = require('../models/Notification.js');
const { validationResult, body } = require('express-validator');
const Student = require('../models/Student.js');
const Teacher = require('../models/Teacher.js');
const Parent = require('../models/Parent.js');
const Class = require('../models/Class.js');
const mongoose = require('mongoose');


const notificationValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('recipientModels').isArray().withMessage('Recipient models must be an array'),
];

exports.createNotification = [
  ...notificationValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const notificationData = req.body;
      const { recipientModels } = notificationData;
      const adminId = req.user._id;

      let allRecipients = [];

      if (recipientModels.includes('Student')) {
        const students = await Student.find({ school: adminId, isActive: true }, '_id');
        allRecipients = allRecipients.concat(students.map(student => student._id));
      }

      if (recipientModels.includes('Teacher')) {
        const teachers = await Teacher.find({ school: adminId, isActive: true  }, '_id');
        allRecipients = allRecipients.concat(teachers.map(teacher => teacher._id));
      }

      if (recipientModels.includes('Parent')) {
        const parents = await Parent.find({ school: adminId, isActive: true  }, '_id');
        allRecipients = allRecipients.concat(parents.map(parent => parent._id));
      }

      if (recipientModels.includes('Class')) {
        const classes = await Class.find({ school: adminId }, '_id');
        allRecipients = allRecipients.concat(classes.map(classModel => classModel._id));
      }

      notificationData.recipients = [...new Set(allRecipients)];
      notificationData.creator = adminId; 

      const notification = new Notification(notificationData);
      await notification.save();

      req.io.emit('newNotification', notification);

      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ message: 'Failed to create notification' });
    }
  },
];

  
exports.markNotificationAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }
  
      const notification = await Notification.findById(notificationId);
  
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      const userId = req.user._id;

      if (!notification.recipients.includes(userId)) {
        return res.status(403).json({ message: 'You are not authorized to mark this notification as read' });
      }
  
      if (notification.readBy.includes(userId)) {
        return res.status(200).json({ message: 'Notification already marked as read by this user' });
      }
  
      notification.readBy.push(userId);

  
      await notification.save();
  
      req.io.emit('notificationRead', notification);
  
      res.status(200).json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};
  
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    let userSchoolId;

    const student = await Student.findById(userId);
    if (student) {
      userSchoolId = student.school;
    }

    if (!userSchoolId) {
      const parent = await Parent.findById(userId);
      if (parent) {
        userSchoolId = parent.school;
      }
    }

    if (!userSchoolId) {
      const teacher = await Teacher.findById(userId);
      if (teacher) {
        userSchoolId = teacher.school;
      }
    }

    if (!userSchoolId) {
      return res.status(404).json({ message: 'User not associated with any school' });
    }

    const notifications = await Notification.find({ 
      recipients: userId,  
      creator: userSchoolId 
    }).sort({ date: -1 });

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'No notifications found' });
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};


exports.getAllNotificationsByAdmin = async (req, res) => {
    try {
      const adminId = req.user._id;
  
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return res.status(400).json({ message: 'Invalid admin ID' });
      }
  
      const notifications = await Notification.find({ creator: adminId }).sort({ date: -1 });
  
      if (!notifications.length) {
        return res.status(404).json({ message: 'No notifications found' });
      }
  
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  };

  exports.getNotificationById = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user._id;
  
      if (!mongoose.Types.ObjectId.isValid(notificationId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
  
      const notification = await Notification.findById(notificationId);
  
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      const isAdmin = notification.creator.toString() === userId.toString();
      const isRecipient = notification.recipients.some(recipient => recipient.toString() === userId.toString());
  
      if (!isAdmin && !isRecipient) {
        return res.status(403).json({ message: 'You are not authorized to view this notification' });
      }
  
      res.status(200).json(notification);
    } catch (error) {
      console.error('Error fetching notification:', error);
      res.status(500).json({ message: 'Failed to fetch notification' });
    }
  };
  
  
  exports.deleteNotification = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const adminId = req.user._id;
  
      if (!mongoose.Types.ObjectId.isValid(notificationId) || !mongoose.Types.ObjectId.isValid(adminId)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }
  
      const result = await Notification.deleteOne({ _id: notificationId, creator: adminId });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Notification not found or not authorized' });
      }
  
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Failed to delete notification' });
    }
  };
  

  exports.updateNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const adminId = req.user._id;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(notificationId) || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, creator: adminId }, 
            { $set: updateData },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or you are not authorized to update it' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Failed to update notification' });
    }
};


  