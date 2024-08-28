const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/authorize");
const eventControllers = require("../controllers/eventControllers");

router.post(
  "/create",
  authenticate,
  authorize(["Admin"]),
  eventControllers.createEvent
);

router.get("/list", authenticate, eventControllers.getAllEvents);

router.get("/details/:id", authenticate, eventControllers.getEventById);

router.put(
  "/update/:id",
  authenticate,
  authorize(["Admin"]),
  eventControllers.updateEvent
);

router.delete(
  "/remove/:id",
  authenticate,
  authorize(["Admin"]),
  eventControllers.deleteEvent
);

module.exports = router;
