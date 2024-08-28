const express = require("express");
const attendanceReportController = require("../controllers/attendanceReportControllers");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

const router = express.Router();

router.post(
  "/generate",
  authenticate,
  authorize("Admin"),
  attendanceReportController.generateAttendanceReport
);

router.get(
  "/details/:studentId",
  authenticate,
  authorize(["Admin", "Parent", "Student"]),
  attendanceReportController.getReportByStudentId
);

router.get(
    "/list",
    authenticate,
    authorize("Admin"),
    attendanceReportController.getAllReports
  );

router.delete(
  "/delete",
  authenticate,
  authorize("Admin"),
  attendanceReportController.deleteAllReports
);

module.exports = router;
