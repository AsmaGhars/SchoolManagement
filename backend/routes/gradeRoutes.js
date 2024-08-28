const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");
const gradeControllers = require("../controllers/gradeControllers");

router.post(
  "/save",
  authenticate,
  authorize(["Teacher"]),
  gradeControllers.saveGrades
);

router.get(
  "/list",
  authenticate,
  authorize("Teacher"),
  gradeControllers.getAllGrades
);

router.get(
  "/details/:studentId",
  authenticate,
  authorize("Admin"),
  gradeControllers.getGradesForStudent
);

router.put(
  "/update/:classId",
  authenticate,
  authorize(["Teacher"]),
  gradeControllers.updateGrades
);

router.delete(
  "/remove",
  authenticate,
  authorize(["Teacher"]),
  gradeControllers.deleteGrades
);

module.exports = router;
