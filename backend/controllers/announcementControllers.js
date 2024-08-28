const Announcement = require("../models/Announcement");
const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Student = require("../models/Student");
const Notification = require("../models/Notification");
const { validationResult, body } = require("express-validator");

const announcementValidationRules = [
  body("subject").notEmpty().withMessage("Subject is required"),
  body("content").notEmpty().withMessage("Content is required"),
];

exports.createAnnouncement = [
  ...announcementValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const announcementData = req.body;
      const adminId = req.user._id;

      const announcement = new Announcement({
        ...announcementData,
        school: adminId,
      });
      await announcement.save();

      const [students, parents, teachers] = await Promise.all([
        Student.find({ school: adminId, isActive: true }, "_id"),
        Parent.find({ school: adminId, isActive: true }, "_id"),
        Teacher.find({ school: adminId }, "_id"),
      ]);

      const notificationData = {
        title: "New Announcement",
        message: `A new announcement has been made: "${announcementData.content}".`,
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

      if (req.io) {
        req.io.emit("newNotification", notification);
      }

      res.status(201).json({ announcement, notification });
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  },
];

exports.getAllAnnouncements = async (req, res) => {
  try {
    const userId = req.user._id;
    let announcements;

    const admin = await Admin.findById(userId);
    if (admin) {
      announcements = await Announcement.find({ school: userId }).sort({
        date: -1,
      });
      return res.status(200).json(announcements);
    }

    const teacher = await Teacher.findById(userId).populate("school");
    if (teacher) {
      announcements = await Announcement.find({
        school: teacher.school._id,
      }).sort({ date: -1 });
      return res.status(200).json(announcements);
    }

    const parent = await Parent.findById(userId).populate("school");
    if (parent) {
      if (!parent.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      announcements = await Announcement.find({
        school: parent.school._id,
      }).sort({ date: -1 });
      return res.status(200).json(announcements);
    }

    const student = await Student.findById(userId).populate("school");
    if (student) {
      if (!student.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      announcements = await Announcement.find({
        school: student.school._id,
      }).sort({ date: -1 });
      return res.status(200).json(announcements);
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const userId = req.user._id;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const admin = await Admin.findById(userId);
    if (admin && announcement.school.equals(userId)) {
      return res.status(200).json(announcement);
    }

    const teacher = await Teacher.findById(userId).populate("school");
    if (teacher && announcement.school.equals(teacher.school._id)) {
      return res.status(200).json(announcement);
    }

    const parent = await Parent.findById(userId).populate("school");
    if (parent) {
      if (!parent.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      if (announcement.school.equals(parent.school._id)) {
        return res.status(200).json(announcement);
      }
    }

    const student = await Student.findById(userId).populate("school");
    if (student) {
      if (!student.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }
      if (announcement.school.equals(student.school._id)) {
        return res.status(200).json(announcement);
      }
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    console.error("Error fetching announcement by ID:", error);
    res.status(500).json({ message: "Failed to fetch announcement" });
  }
};

exports.updateAnnouncement = [
  ...announcementValidationRules,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const announcementId = req.params.id;
      const adminId = req.user._id;

      const announcement = await Announcement.findById(announcementId);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      if (!announcement.school.equals(adminId)) {
        return res
          .status(403)
          .json({
            message: "You are not authorized to update this announcement",
          });
      }

      const updatedData = req.body;
      const updatedAnnouncement = await Announcement.findByIdAndUpdate(
        announcementId,
        updatedData,
        {
          new: true,
        }
      );

      const [students, parents, teachers] = await Promise.all([
        Student.find({ school: adminId, isActive: true }, "_id"),
        Parent.find({ school: adminId, isActive: true }, "_id"),
        Teacher.find({ school: adminId }, "_id"),
      ]);

      const notificationData = {
        title: "Announcement Updated",
        message: `The announcement with content "${updatedAnnouncement.content}" has been updated.`,
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

      res.status(200).json({ announcement: updatedAnnouncement, notification });
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  },
];

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcementId = req.params.id;
    const adminId = req.user._id;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (!announcement.school.equals(adminId)) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to delete this announcement",
        });
    }

    await Announcement.findByIdAndDelete(announcementId);

    const [students, parents, teachers] = await Promise.all([
      Student.find({ school: adminId, isActive: true }, "_id"),
      Parent.find({ school: adminId, isActive: true }, "_id"),
      Teacher.find({ school: adminId }, "_id"),
    ]);

    const notificationData = {
      title: "Announcement Deleted",
      message: `The announcement with content "${announcement.content}" has been deleted.`,
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
      .json({ message: "Announcement deleted successfully", notification });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};
