const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");
const courseControllers = require("../controllers/courseControllers");

router.post(
    "/create",
    authenticate,
    authorize(["Admin"]),
    courseControllers.createCourse
);

router.get(
    "/list",
    authenticate,
    authorize(["Admin"]),
    courseControllers.listCourses
);

router.get(
    "/details/:id",
    authenticate,
    authorize(["Admin"]),
    courseControllers.getCourseById
);

router.put(
    "/update/:id",
    authenticate,
    authorize(["Admin"]),
    courseControllers.updateCourse
);

router.delete(
    "/remove/:id",
    authenticate,
    authorize(["Admin"]),
    courseControllers.deleteCourse
);

router.get(
    "/coursesteacher/:teacherId",
    authenticate,
    authorize(["Admin"]),
    courseControllers.listCoursesByTeacher
);

router.get(
    "/coursesclass/:classId",
    authenticate,
    authorize(["Admin"]),
    courseControllers.listCoursesByClass
);

router.get(
    "/coursessubject/:subjectId",
    authenticate,
    authorize(["Admin"]),
    courseControllers.listCoursesBySubject
);

router.get(
    '/empty', 
    authenticate,
    authorize(["Admin"]),
    courseControllers.listEmptyClassrooms
);

module.exports = router;
