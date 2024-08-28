const express = require("express");
const absenceController = require("../controllers/absenceControllers");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

const router = express.Router();

router.post(
  "/record",
  authenticate,
  authorize("Teacher"),
  absenceController.recordAbsence
);

router.get(
  "/details/:studentId",
  authenticate,
  authorize(["Admin", "Teacher"]),
  absenceController.getStudentAbsences
);

router.put(
  "/update/:absenceId",
  authenticate,
  authorize("Teacher"),
  absenceController.updateAbsenceStatus
);

router.delete(
  "/delete/:absenceId",
  authenticate,
  authorize("Teacher"),
  absenceController.deleteAbsence
);

module.exports = router;
