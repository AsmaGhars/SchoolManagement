const Event = require("../models/Event");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Admin = require("../models/Admin");
const { validationResult, body } = require("express-validator");

const eventValidationRules = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("date").isISO8601().withMessage("Valid date is required"),
  body("location").notEmpty().withMessage("Location is required"),
];

exports.createEvent = [
  ...eventValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const eventData = req.body;
      const adminId = req.user._id;

      const event = new Event({ ...eventData, school: adminId });
      await event.save();

      const announcement = new Announcement({
        event: event._id,
        content: `New event: ${event.title} is scheduled for ${event.date}.`,
        school: adminId,
      });
      await announcement.save();

      const [students, parents, teachers] = await Promise.all([
        Student.find({ school: adminId, isActive: true }, "_id"),
        Parent.find({ school: adminId, isActive: true }, "_id"),
        Teacher.find({ school: adminId }, "_id"),
      ]);

      const notificationData = {
        title: "New Event Created",
        message: `A new event titled "${event.title}" has been created. Check it out!`,
        creator: adminId,
        recipients: [
          ...students.map((student) => student._id),
          ...parents.map((parent) => parent._id),
          ...teachers.map((teacher) => teacher._id),
        ],
      };

      notificationData.recipients = [...new Set(notificationData.recipients)];

      const notification = new Notification(notificationData);
      await notification.save();

      req.io.emit("newNotification", notification);

      res.status(201).json({ event, announcement, notification });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  },
];

exports.getAllEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    let events;

    const admin = await Admin.findById(userId);
    if (admin) {
      events = await Event.find({ school: userId }).sort({ date: -1 });
      return res.status(200).json(events);
    }

    const teacher = await Teacher.findById(userId).populate("school");
    if (teacher) {
      events = await Event.find({ school: teacher.school._id }).sort({
        date: -1,
      });
      return res.status(200).json(events);
    }

    const parent = await Parent.findById(userId).populate("school");
    if (parent) {
      if (!parent.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      events = await Event.find({ school: parent.school._id }).sort({
        date: -1,
      });
      return res.status(200).json(events);
    }

    const student = await Student.findById(userId).populate("school");
    if (student) {
      if (!student.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      events = await Event.find({ school: student.school._id }).sort({
        date: -1,
      });
      return res.status(200).json(events);
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const admin = await Admin.findById(userId);
    if (admin && event.school.equals(userId)) {
      return res.status(200).json(event);
    }

    const teacher = await Teacher.findById(userId).populate("school");
    if (teacher && event.school.equals(teacher.school._id)) {
      return res.status(200).json(event);
    }

    const parent = await Parent.findById(userId).populate("school");
    if (parent) {
      if (!parent.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      if (event.school.equals(parent.school._id)) {
        return res.status(200).json(event);
      }
    }

    const student = await Student.findById(userId).populate("school");
    if (student) {
      if (!student.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      if (event.school.equals(student.school._id)) {
        return res.status(200).json(event);
      }
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

exports.updateEvent = [
  ...eventValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const eventId = req.params.id;
      const adminId = req.user._id;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!event.school.equals(adminId)) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this event" });
      }

      const updatedData = req.body;
      const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedData, {
        new: true,
      });

      const announcement = await Announcement.findOne({ event: eventId });
      if (announcement) {
        announcement.content = `Updated event: ${updatedEvent.title} is now scheduled for ${updatedEvent.date}.`;
        await announcement.save();
      }

      const [students, parents, teachers] = await Promise.all([
        Student.find({ school: adminId, isActive: true }, "_id"),
        Parent.find({ school: adminId, isActive: true }, "_id"),
        Teacher.find({ school: adminId }, "_id"),
      ]);

      const notificationData = {
        title: "Event Updated",
        message: `The event titled "${updatedEvent.title}" has been updated. Check out the new details!`,
        creator: adminId,
        recipients: [
          ...students.map((student) => student._id),
          ...parents.map((parent) => parent._id),
          ...teachers.map((teacher) => teacher._id),
        ],
      };

      notificationData.recipients = [...new Set(notificationData.recipients)];

      const notification = new Notification(notificationData);
      await notification.save();

      req.io.emit("newNotification", notification);

      res.status(200).json({ event: updatedEvent, announcement, notification });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  },
];

exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const adminId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.school.equals(adminId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(eventId);

    await Announcement.findOneAndDelete({ event: eventId });

    const [students, parents, teachers] = await Promise.all([
      Student.find({ school: adminId, isActive: true }, "_id"),
      Parent.find({ school: adminId, isActive: true }, "_id"),
      Teacher.find({ school: adminId }, "_id"),
    ]);

    const notificationData = {
      title: "Event Deleted",
      message: `The event titled "${event.title}" has been deleted.`,
      creator: adminId,
      recipients: [
        ...students.map((student) => student._id),
        ...parents.map((parent) => parent._id),
        ...teachers.map((teacher) => teacher._id),
      ],
    };

    notificationData.recipients = [...new Set(notificationData.recipients)];

    const notification = new Notification(notificationData);
    await notification.save();

    req.io.emit("newNotification", notification);

    res
      .status(200)
      .json({ message: "Event deleted successfully", notification });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
