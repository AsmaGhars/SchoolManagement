const express = require('express');
const router = express.Router();
const adminControllers = require ('../controllers/adminControllers');
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");


router.post('/signup', adminControllers.signup);
router.post('/login', adminControllers.login);
router.get('/list', adminControllers.getAdmins);
router.get(
    '/details',
    authenticate,
    authorize(['Admin']),
    adminControllers.adminDetails
);
router.put(
    '/update',
    authenticate,
    authorize(['Admin']),
    adminControllers.updateAdmin
);
router.delete(
    '/delete', 
    authenticate,
    authorize(['Admin']),
    adminControllers.deleteAdmin
);

router.put(
    '/change-password',
    authenticate,
    authorize(['Admin']),
    adminControllers.changePassword
);

router.post(
    "/forgot-password",
    adminControllers.forgotPassword
);

router.post(
    '/reset-password/:token',
     adminControllers.resetPassword
);

router.post(
    '/logout',
    authenticate,
    authorize(['Admin']),
    adminControllers.logout
);

module.exports = router;