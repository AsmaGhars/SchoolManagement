const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");
const inscriptionControllers = require("../controllers/inscriptionControllers");

router.post(
    "/create",
    authenticate,
    authorize(["Admin"]),
    inscriptionControllers.createInscription
);

router.get(
    "/list",
    authenticate,
    authorize(["Admin"]),
    inscriptionControllers.getAllInscriptions
);

router.get(
    "/details/:id",
    authenticate,
    authorize(["Admin"]),
    inscriptionControllers.getInscriptionById
);

router.put(
    "/update/:id",
    authenticate,
    authorize(["Admin"]),
    inscriptionControllers.updateInscription
);

router.delete(
    "/remove/:id",
    authenticate,
    authorize(["Admin"]),
    inscriptionControllers.deleteInscription
);


module.exports = router;
