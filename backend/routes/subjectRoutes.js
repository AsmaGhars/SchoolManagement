const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectControllers');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.post('/create',
    authenticate,
    authorize(['Admin']),
    subjectController.createSubject
);
router.get(
    '/list',
    authenticate,
    authorize(['Admin', 'Teacher']),
    subjectController.getAllSubjects
);

router.get(
    '/details/:id',
    authenticate,
    authorize(['Admin']),
    subjectController.getSubjectById
);

router.put(
    '/update/:id',
    authenticate,
    authorize(['Admin']),
    subjectController.updateSubject
);

router.delete(
    '/delete/:id',
    authenticate,
    authorize(['Admin']),
    subjectController.deleteSubject
);

router.get(
    '/free',
    authenticate,
    authorize(['Admin']),
    subjectController.freeSubjectList
);

module.exports = router;