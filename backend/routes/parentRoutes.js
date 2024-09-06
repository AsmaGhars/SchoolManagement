const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentControllers');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.post(
    '/addparent',
    authenticate,
    authorize(['Admin']),
    parentController.addParent
);

router.post(
    '/login', 
    parentController.login
);

router.post(
    '/logout',
    authenticate,
    authorize(['Parent']),
    parentController.logout
);

router.get(
    '/list',
    authenticate,
    authorize(['Admin']),
    parentController.getParents
);

router.get(
    '/details/:id',
    authenticate,
    authorize(['Parent','Admin']),
    parentController.parentDetails
);

router.get(
    '/parent-details',
    authenticate,
    authorize(['Parent']),
    parentController.parentDetailsParent
);

router.put(
    '/update',
    authenticate,
    authorize(['Parent']),
    parentController.updateParent
);

router.delete(
    '/delete/:parentId', 
    authenticate,
    authorize(['Admin']),
    parentController.deleteParent
);

router.put(
    '/change-password',
    authenticate,
    authorize(['Parent']),
    parentController.changePassword
);

router.post(
    "/forgot-password",
    parentController.forgotPassword
);

router.post(
    '/reset-password/:token',
     parentController.resetPassword
);

router.post(
    '/addchild/:parentId',
    authenticate,
    authorize(['Admin']),
    parentController.addChild
);

router.delete(
    '/removechild/:parentId',
    authenticate,
    authorize(['Admin']),
    parentController.removeChild
);

router.get(
    '/getchildren/:parentId',
    authenticate,
    authorize(['Admin']),
    parentController.getChildren
);

router.get(
    '/children',
    authenticate,
    authorize(['Parent']),
    parentController.Children
);

module.exports = router;