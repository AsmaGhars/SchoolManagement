const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentControllers');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.post(
    '/addstudent',
    authenticate,
    authorize(['Admin']),
    studentController.addStudent
);
router.post(
    '/login', 
    studentController.login
);

router.get(
    '/list',
    authenticate,
    authorize(['Teacher', 'Admin']),
    studentController.getStudents
);

router.get(
    '/details/:id',
    authenticate,
    authorize(['Student','Admin']),
    studentController.studentDetails
);

router.put(
    '/update',
    authenticate,
    authorize(['Student']),
    studentController.updateStudent
);

router.delete(
    '/delete/:studentId', 
    authenticate,
    authorize(['Admin']),
    studentController.deleteStudent
);

router.put(
    '/change-password',
    authenticate,
    authorize(['Student']),
    studentController.changePassword
);

router.post(
    "/forgot-password",
    studentController.forgotPassword
);

router.post(
    '/reset-password/:token',
     studentController.resetPassword
);

router.get(
    '/free',
    authenticate,
    authorize(['Admin']),
    studentController.freeStudentList
);

router.get(
    '/getparent/:studentId',
    authenticate,
    authorize(['Admin']),
    studentController.getParent
);

router.post(
    '/logout',
    authenticate,
    authorize(['Student']),
    studentController.logout
);

router.get(
    '/student-details',
    authenticate,
    authorize(['Student']),
    studentController.studentDetailsStudent
);

module.exports = router;