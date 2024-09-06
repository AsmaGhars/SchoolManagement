const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherControllers');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.post(
    '/addteacher',
    authenticate,
    authorize(['Admin']),
    teacherController.addTeacher
);
router.post(
    '/login', 
    teacherController.login
);

router.post(
    '/logout',
    authenticate,
    authorize(['Teacher']),
    teacherController.logout
);


router.get(
    '/list',
    authenticate,
    authorize(['Admin']),
    teacherController.getTeachers
);

router.get(
    '/details/:id',
    authenticate,
    authorize(['Teacher','Admin']),
    teacherController.teacherDetails
);

router.put(
    '/update',
    authenticate,
    authorize(['Teacher']),
    teacherController.updateTeacher
);

router.delete(
    '/delete/:teacherId', 
    authenticate,
    authorize(['Admin']),
    teacherController.deleteTeacher
);

router.put(
    '/change-password',
    authenticate,
    authorize(['Teacher']),
    teacherController.changePassword
);

router.post(
    "/forgot-password",
    teacherController.forgotPassword
);

router.post(
    '/reset-password/:token',
    teacherController.resetPassword
);

router.get(
    '/by-subject', 
    authenticate,
    authorize(['Admin']),
    teacherController.getTeachersBySubject
);

router.get(
    '/teacher-details',
    authenticate,
    authorize(['Teacher']),
    teacherController.teacherDetailsTeacher
);


module.exports = router;