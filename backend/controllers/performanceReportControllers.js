const Student = require("../models/Student");
const Bulletin = require("../models/Bulletin");
const PerformanceReport = require("../models/PerfermanceReport");
const Parent = require("../models/Parent");

exports.generatePerformanceReport = async (req, res) => {
  try {
    const adminId = req.user.id;

    const students = await Student.find({ school: adminId, isActive: true });

    if (!students.length) {
      return res.status(404).json({ message: 'No active students found in the school' });
    }

    for (const student of students) {
      const studentId = student._id;

      const bulletins = await Bulletin.find({ studentId }).populate("subjects.subjectId");

      let totalAverage = 0;
      let totalSubjects = 0;
      let passedSubjects = 0;
      let failedSubjects = 0;

      bulletins.forEach((bulletin) => {
        bulletin.subjects.forEach((subject) => {
          const weightedGrade = ((subject.controleGrade + 2 * subject.syntheseGrade) / 3) * subject.coefficient;
          totalAverage += weightedGrade;
          totalSubjects += subject.coefficient;
          const averageGrade = (subject.controleGrade + 2 * subject.syntheseGrade) / 3;
          if (averageGrade >= 10) {
            passedSubjects += 1;
          } else {
            failedSubjects += 1;
          }
        });
      });

      const finalAverage = totalSubjects > 0 ? totalAverage / totalSubjects : 0;

      const performanceReportData = {
        studentId,
        adminId,
        studentName: student.name,
        finalAverage,
        passedSubjects,
        failedSubjects,
        totalSubjects,
        trimesters: bulletins.map((bulletin) => ({
          trimester: bulletin.trimester,
          average: bulletin.average,
        })),
      };

      await PerformanceReport.findOneAndDelete({ studentId });

      const performanceReport = new PerformanceReport(performanceReportData);
      await performanceReport.save();
    }

    return res.status(200).json({ message: 'Performance reports generated successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error generating performance reports', error: error.message });
  }
};


exports.deletePerformanceReport = async (req, res) => {
  try {

    const adminId = req.user.id;
    const result = await PerformanceReport.deleteMany({ adminId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No performance reports found for this admin" });
    }

    return res
      .status(200)
      .json({ message: "Performance report deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting report", error: error.message });
  }
};

exports.getAllPerformanceReports = async (req, res) => {
    try {
        const adminId = req.user.id; 

        const reports = await PerformanceReport.find({ adminId });

        if (reports.length === 0) {
            return res.status(404).json({ message: 'No performance reports found for this admin' });
        }

        return res.status(200).json({ reports });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving reports', error: error.message });
    }
};

exports.getPerformanceReportById = async (req, res) => {
    try {
        const { studentId } = req.params; 
        const userId = req.user._id;
        const userRole = req.user.role;

        const report = await PerformanceReport.findOne({ studentId })
            .populate('studentId', 'name school isActive') 
            .exec();

        if (!report) {
            return res.status(404).json({ message: "Performance report not found" });
        }

        const student = report.studentId;

        if (userRole === 'Admin') {
            if (report.adminId.toString() !== userId.toString() || student.school.toString() !== userId.toString()) {
                return res.status(403).json({ message: "Unauthorized access" });
            }
        } else if (userRole === 'Student') {
            if (student._id.toString() !== userId.toString()) {
                return res.status(403).json({ message: "Unauthorized access" });
            }
        } else if (userRole === 'Parent') {
            const parent = await Parent.findOne({
                _id: userId,
                children: student._id,
                isActive: true
            });

            if (!parent || !student.isActive) {
                return res.status(403).json({ message: "Unauthorized access or account not active" });
            }
        } else {
            return res.status(403).json({ message: "Unauthorized access: unknown user role" });
        }

        return res.status(200).json(report);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};