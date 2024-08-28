const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

const classControllers = require("../controllers/classControllers");

router.post(
  "/create",
  authenticate,
  authorize(["Admin"]),
  classControllers.createClass
);
router.get(
  "/list",
  authenticate,
  authorize(["Admin"]),
  classControllers.listClasses
);
router.get(
  "/details/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.getclassDetail
);
router.put(
  "/update/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.updateClass
);
router.delete(
  "/delete/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.deleteClass
);
router.post(
  "/addstudent/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.addStudent
);
router.delete(
  "/deletestudent/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.removeStudent
);
router.post(
  "/addsubject/:id/subjects",
  authenticate,
  authorize(["Admin"]),
  classControllers.addSubject
);

router.delete(
  "/deletesubject/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.deleteSubject
);

router.get(
  "/liststudents/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.listStudents
);

router.put(
  "/changeteacher/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.changeTeacher
);

router.get(
  "/listteachers/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.listTeachers
);

router.get(
  "/listsubjects/:id",
  authenticate,
  authorize(["Admin"]),
  classControllers.listSubjects
);

router.post(
  "/transfer-student",
  authenticate,
  authorize(["Admin"]),
  classControllers.transferStudent
);

module.exports = router;
