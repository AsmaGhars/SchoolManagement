const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");
const financialReportController = require("../controllers/financialReportControllers");

router.post(
  "/generate",
  authenticate,
  authorize("Admin"),
  financialReportController.generateReport
);

router.get(
  "/get",
  authenticate,
  authorize("Admin"),
  financialReportController.getReports
);

module.exports = router;
