const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");
const announcementControllers = require("../controllers/announcementControllers");

router.post(
  "/create",
  authenticate,
  authorize(["Admin"]),
  announcementControllers.createAnnouncement
);

router.get("/list", authenticate, announcementControllers.getAllAnnouncements);

router.get("/details/:id", authenticate, announcementControllers.getAnnouncementById);

router.put(
  "/update/:id",
  authenticate,
  authorize(["Admin"]),
  announcementControllers.updateAnnouncement
);

router.delete(
  "/remove/:id",
  authenticate,
  authorize(["Admin"]),
  announcementControllers.deleteAnnouncement
);

module.exports = router;
