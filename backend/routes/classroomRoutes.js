const express = require('express');
const classroomController = require('../controllers/classroomControllers');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

const router = express.Router();

router.post(
    '/create', 
    authenticate,
    authorize(['Admin']),
    classroomController.createClassroom
);

router.get(
    '/list',
    authenticate,
    authorize(['Admin']),
    classroomController.getAllClassrooms
);

router.get(
    '/details/:id',
    authenticate,
    authorize(['Admin']),
    classroomController.getClassroomById
);

router.put(
    '/update/:id',
    authenticate,
    authorize(['Admin']),
    classroomController.updateClassroom
);

router.delete(
    '/delete/:id',
    authenticate,
    authorize(['Admin']),
    classroomController.deleteClassroom
);


module.exports = router;