const express = require("express");
const router = express.Router();
const performanceReportController = require("../controllers/performanceReportControllers");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.post(
    "/generate",
    authenticate,
    authorize("Admin"),
    performanceReportController.generatePerformanceReport
  );

  router.delete(
    "/delete",
    authenticate,
    authorize("Admin"),
    performanceReportController.deletePerformanceReport
  );

  router.get(
    "/list",
    authenticate,
    authorize("Admin"),
    performanceReportController.getAllPerformanceReports
  );

  router.get(
    "/details/:studentId",
    authenticate,
    authorize(["Admin", "Parent", "Student"]),
    performanceReportController.getPerformanceReportById
  );

module.exports = router;
