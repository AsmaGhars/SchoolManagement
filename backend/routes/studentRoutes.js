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
    authorize(['Admin']),
    studentController.getStudents
);

router.get(
    '/details/:id',
    authenticate,
    authorize(['Student','Admin']),
    studentController.studentDetails
);

router.put(
    '/update/:studentId',
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
    '/change-password/:studentId',
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


module.exports = router;