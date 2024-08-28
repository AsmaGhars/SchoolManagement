const Grade = require("../models/Grade");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Bulletin = require("../models/Bulletin");
const Class = require("../models/Class");
const Parent = require("../models/Parent");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const uuid = require('uuid');

exports.generateBulletins = async (req, res) => {
  try {
    const adminId = req.user._id;
    const trimester = req.query.trimester;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin or school not found" });
    }

    const classes = await Class.find({ school: adminId });

    if (classes.length === 0) {
      return res.status(404).json({ message: "No classes found in the school" });
    }

    const students = [];
    for (const cls of classes) {
      students.push(...cls.students);
    }

    const uniqueStudentIds = [...new Set(students)];

    const studentDocuments = await Student.find({
      _id: { $in: uniqueStudentIds },
    });

    if (!studentDocuments.length) {
      return res.status(404).json({ message: "No students found in the school" });
    }

    let bulletins = [];

    for (const student of studentDocuments) {
      const grades = await Grade.find({
        studentId: student._id,
        trimester: trimester,
      }).populate("subjectId", "subName coefficient");

      const classSubjects = await Grade.distinct("subjectId", {
        studentId: student._id,
        trimester: trimester,
      });

      const bulletin = {
        studentId: student._id,
        trimester: trimester,
        subjects: [],
        average: null,
        school: adminId
      };

      let totalWeightedGrades = 0;
      let totalCoefficients = 0;

      for (const subjectId of classSubjects) {
        const subjectGrades = grades.find(
          (grade) => grade.subjectId._id.toString() === subjectId.toString()
        );

        if (subjectGrades) {
          const {
            controleGrade,
            syntheseGrade,
            subjectId: sub,
          } = subjectGrades;

          const weightedAverage = (controleGrade * 1 + syntheseGrade * 2) / (1 + 2);



          bulletin.subjects.push({
            subjectId: subjectId,
            controleGrade: controleGrade,
            syntheseGrade: syntheseGrade,
            coefficient: sub.coefficient,
            weightedAverage: weightedAverage,
          });

          totalWeightedGrades += weightedAverage * sub.coefficient;
          totalCoefficients += sub.coefficient;
        }
      }

      bulletin.average =
        totalCoefficients > 0 ? totalWeightedGrades / totalCoefficients : null;


      bulletins.push(bulletin);
    }

    await Bulletin.deleteMany({ trimester: trimester, school: adminId });
    await Bulletin.insertMany(bulletins);

    res.status(200).json({ bulletins });
  } catch (error) {
    console.error("Error generating bulletins:", error);
    res.status(500).json({ message: "Error generating bulletins", error });
  }
};


exports.getStudentBulletin = async (req, res) => {
  try {
    const userId = req.user._id;
    const studentId = req.query.studentId;
    const trimester = req.query.trimester;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const admin = await Admin.findById(userId);
    if (admin) {
      if (userId.toString() !== student.school.toString()) {
        return res.status(403).json({ message: "You are not authorized to view this student" });
      }
      const bulletin = await Bulletin.findOne({
        studentId: studentId,
        trimester: trimester
      }).populate('subjects.subjectId', 'subName');
      
      if (bulletin) {
        return res.status(200).json({ bulletin });
      }
      return res.status(404).json({ message: "Bulletin not found for the student" });
    }

    const parent = await Parent.findById(userId);
    if (parent && parent.isActive && parent.children.includes(studentId)) {
      const bulletin = await Bulletin.findOne({
        studentId: studentId,
        trimester: trimester
      }).populate('subjects.subjectId', 'subName');

      if (bulletin) {
        return res.status(200).json({ bulletin });
      }
      return res.status(404).json({ message: "Bulletin not found for the student" });
    }

    const studentUser = await Student.findById(userId);
    if (studentUser && studentUser._id.toString() === studentId && studentUser.isActive) {
      const bulletin = await Bulletin.findOne({
        studentId: studentId,
        trimester: trimester
      }).populate('subjects.subjectId', 'subName');

      if (bulletin) {
        return res.status(200).json({ bulletin });
      }
      return res.status(404).json({ message: "Bulletin not found for the student" });
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error retrieving student bulletin:", error);
    res.status(500).json({ message: "Error retrieving student bulletin", error });
  }
};


exports.deleteBulletinsByTrimester = async (req, res) => {
  try {
    const adminId = req.user._id;
    const trimester = req.query.trimester;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const result = await Bulletin.deleteMany({ trimester: trimester, school: adminId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No bulletins found for the specified trimester" });
    }

    res.status(200).json({ message: `Deleted ${result.deletedCount} bulletins for trimester ${trimester}` });
  } catch (error) {
    console.error("Error deleting bulletins:", error);
    res.status(500).json({ message: "Error deleting bulletins", error });
  }
};

exports.downloadBulletinAsPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const studentId = req.query.studentId;
    const trimester = req.query.trimester;

    const student = await Student.findById(studentId);
    if (!student || !student.isActive) {
      return res.status(404).json({ message: "Student not found or not active" });
    }

    const bulletin = await Bulletin.findOne({
      studentId: studentId,
      trimester: trimester
    }).populate('subjects.subjectId', 'subName');

    if (!bulletin) {
      return res.status(404).json({ message: "Bulletin not found" });
    }

    const admin = await Admin.findById(userId);
    if (admin && bulletin.school.toString() === userId.toString()) {
      return generateAndSendPDF(res, student, bulletin, trimester);
    }

    const parent = await Parent.findById(userId);
    if (parent && parent.isActive && parent.children.includes(studentId)) {
      return generateAndSendPDF(res, student, bulletin, trimester);
    }

    if (userId.toString() === student._id.toString() && student.isActive) {
      return generateAndSendPDF(res, student, bulletin, trimester);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Error generating bulletin PDF:", error);
    res.status(500).json({ message: "Error generating bulletin PDF", error });
  }
};

async function generateAndSendPDF(res, student, bulletin, trimester) {
  try {
    const admin = await Admin.findById(student.school); 
    if (!admin) {
      throw new Error('Admin not found');
    }
    const studentClass = await Class.findOne({ students: student._id }); 
    if (!studentClass) {
      throw new Error('Class not found');
    }
    
    const doc = new PDFDocument();
    const userDownloadsDir = os.homedir(); 
    const pdfDir = path.join(userDownloadsDir, 'Downloads');
    const pdfPath = path.join(pdfDir, `${student.name}_bulletin_trimester_${trimester}_${uuid.v4()}.pdf`);

    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(25).text(`Bulletin for ${student.name}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Trimester: ${trimester}`);
    doc.text(`School: ${admin.schoolName || 'N/A'}`); 
    doc.text(`Class: ${studentClass.className || 'N/A'}`);
    doc.moveDown();
    doc.fontSize(16).text('Grades:', { underline: true });

    bulletin.subjects.forEach(subject => {
      doc.text(`Subject: ${subject.subjectId.subName}`);
      doc.text(`Control Grade: ${subject.controleGrade}`);
      doc.text(`Synthesis Grade: ${subject.syntheseGrade}`);
      doc.text(`Coefficient: ${subject.coefficient}`);
      doc.moveDown();
    });

    doc.moveDown();
    doc.text(`Overall Average: ${bulletin.average !== undefined ? bulletin.average.toFixed(2) : 'N/A'}`);
    doc.end();

    doc.on('finish', () => {
      res.download(pdfPath, `${student.name}_bulletin_trimester_${trimester}.pdf`, err => {
        if (err) {
          console.error("Error downloading PDF:", err);
          res.status(500).json({ message: "Error downloading PDF", error: err });
        }
        fs.unlink(pdfPath, err => {
          if (err) console.error("Error deleting PDF file:", err);
        });
      });
    });
  } catch (error) {
    console.error("Error generating bulletin PDF:", error);
    res.status(500).json({ message: "Error generating bulletin PDF", error });
  }
}
