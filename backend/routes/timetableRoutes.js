const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

const timetableControllers = require("../controllers/timetableControllers");

router.post(
  "/create-class",
  authenticate,
  authorize(["Admin"]),
  timetableControllers.createTimetableForClass
);

router.get(
  "/get-class/:id",
  authenticate,
  authorize(["Admin", "Student"]),
  timetableControllers.getTimetableForClass
);

router.get(
  "/list-class",
  authenticate,
  authorize(["Admin"]),
  timetableControllers.getAllClassTimetables
);

router.post(
  "/create-teacher",
  authenticate,
  authorize(["Admin"]),
  timetableControllers.createTimetableForTeacher
);

router.get(
  "/get-teacher/:id",
  authenticate,
  authorize(["Admin", "Teacher"]),
  timetableControllers.getTimetableForTeacher
);

router.get(
  "/list-teachers",
  authenticate,
  authorize(["Admin"]),
  timetableControllers.getAllTeachersTimetables
);

router.post(
  "/create-all-teachers",
  authenticate,
  authorize(["Admin"]),
  timetableControllers.createTimetablesForAllTeachers
);

router.post(
  "/create-all-classes",
  authenticate,
  authorize(["Admin"]),
  timetableControllers.createTimetablesForAllClasses
);

router.delete(
  "/delete-class/:id",
  authenticate,
  authorize(["Admin"]),
  timetableControllers.deleteTimetableForClass
);

router.delete(
  "/delete-teacher/:id",
  authenticate,
  authorize(["Admin"]),
  timetableControllers.deleteTimetableForTeacher
);

module.exports = router;
