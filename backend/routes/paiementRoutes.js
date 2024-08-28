const express = require("express");
const router = express.Router();
const paiementController = require("../controllers/paiementControllers");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");

router.post(
  "/create",
  authenticate,
  authorize("Student"),
  paiementController.createPaiement
);

router.get(
  "/facture/:id",
  authenticate,
  authorize("Student"),
  paiementController.getFacture
);
router.post(
  "/confirm",
  authenticate,
  authorize("Student"),
  paiementController.confirmPaiement
);

module.exports = router;
