const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");
const bulletinControllers = require("../controllers/bulletinController.js");

router.get(
  "/details",
  authenticate,
  authorize(["Admin", "Parent", "Student"]),
  bulletinControllers.getStudentBulletin
);

router.delete(
  "/remove",
  authenticate,
  authorize(["Admin"]),
  bulletinControllers.deleteBulletinsByTrimester
);

router.post(
  "/generate",
  authenticate,
  authorize("Admin"),
  bulletinControllers.generateBulletins
);

router.get(
  "/download",
  authenticate,
  authorize(["Admin", "Parent", "Student"]),
  bulletinControllers.downloadBulletinAsPDF
);

module.exports = router;
