const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardControllers');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.get(
    '/get',
    authenticate,
    authorize("Admin"),
    dashboardController.getDashboardData);

module.exports = router;
