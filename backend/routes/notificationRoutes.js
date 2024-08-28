const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationControllers.js');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

const router = express.Router();

router.post(
  '/create',
  authenticate,
  authorize(["Admin"]),
  notificationController.createNotification
);

router.put(
    '/:notificationId/read', 
    authenticate,
    authorize(["Admin", "Parent", "Teacher", "Student"]),
    notificationController.markNotificationAsRead
);

router.get(
    '/user', 
    authenticate,
    authorize(["Parent", "Student", "Teacher", "Admin"]),
    notificationController.getUserNotifications
);

router.get(
    '/list', 
    authenticate,
    authorize(["Admin"]),
    notificationController.getAllNotificationsByAdmin
);

router.get(
    '/details/:notificationId', 
    authenticate, 
    authorize(["Parent", "Student", "Teacher", "Admin"]),
    notificationController.getNotificationById
);

router.delete(
    '/delete/:notificationId', 
    authenticate, 
    authorize(["Admin"]),
    notificationController.deleteNotification
);

router.put(
    '/update/:notificationId', 
    authenticate,
    authorize(["Admin"]),
    notificationController.updateNotification
);

module.exports = router;
