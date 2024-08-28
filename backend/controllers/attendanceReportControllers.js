const Absence = require("../models/Absence");
const Student = require("../models/Student");
const AttendanceReport = require("../models/AttendanceReport");
const Parent = require("../models/Parent");

exports.generateAttendanceReport = async (req, res) => {
  try {
    const adminId = req.user._id;

    const students = await Student.find({ school: adminId, isActive: true });

    if (!students.length) {
      return res.status(404).json({ message: "No active students found in the school" });
    }

    for (const student of students) {
      const studentId = student._id;

      const statistics = await Absence.aggregate([
        { $match: { studentId: studentId } },
        {
          $group: {
            _id: "$studentId",
            totalAbsences: {
              $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] }
            },
            totalPresences: {
              $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
            },
            totalLate: {
              $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] }
            }
          }
        }
      ]);

      const reportData = {
        studentId,
        adminId,
        totalAbsences: statistics[0]?.totalAbsences || 0,
        totalPresences: statistics[0]?.totalPresences || 0,
        totalLate: statistics[0]?.totalLate || 0,
      };

      await AttendanceReport.findOneAndDelete({ studentId });

      const report = new AttendanceReport(reportData);
      await report.save();
    }

    res.json({ message: "Reports generated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.deleteAllReports = async (req, res) => {
  try {
    const adminId = req.user._id;

    const students = await Student.find({ school: adminId, isActive: true });

    if (!students.length) {
      return res
        .status(404)
        .json({ message: "No active students found in the school" });
    }

    const studentIds = students.map((student) => student._id);

    const result = await AttendanceReport.deleteMany({
      studentId: { $in: studentIds },
      adminId: adminId,
    });

    return res
      .status(200)
      .json({ message: `${result.deletedCount} reports deleted successfully` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const adminId = req.user._id;

    const students = await Student.find({ school: adminId, isActive: true });

    if (!students.length) {
      return res
        .status(404)
        .json({ message: "No active students found in the school" });
    }

    const studentIds = students.map((student) => student._id);
    const reports = await AttendanceReport.find({
      studentId: { $in: studentIds },
      adminId: adminId,
    });
    if (!reports.length) {
      return res
        .status(404)
        .json({ message: "No attendance reports found for this admin" });
    }

    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getReportByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const reports = await AttendanceReport.find({ studentId }).exec();

    if (!reports.length) {
      return res
        .status(404)
        .json({ message: "No reports found for this student" });
    }

    const student = await Student.findById(studentId).exec();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (userRole === "Admin") {
      if (student.school.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
    } else if (userRole === "Student") {
      if (userId.toString() !== studentId.toString()) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
    } else if (userRole === "Parent") {
      const parent = await Parent.findOne({
        _id: userId,
        children: studentId,
        isActive: true
      });

      if (!parent) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
    } else {
      return res.status(403).json({ message: "Invalid user role" });
    }

    return res.status(200).json(reports);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
