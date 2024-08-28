const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageControllers');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.post('/send', 
    authenticate,
    authorize(['Admin', 'Parent', 'Teacher']),
    MessageController.sendMessage
);

router.get('/received', 
    authenticate,
    authorize(['Admin', 'Parent', 'Teacher']),
    MessageController.getReceivedMessages
);

module.exports = router;

