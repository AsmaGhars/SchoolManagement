const Inscription = require("../models/Inscription");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Payment = require("../models/Paiment");
const Parent = require("../models/Parent");
const Admin = require("../models/Admin");

const validateAcademicYear = (year) => {
  const regex = /^\d{4}-\d{4}$/;
  return regex.test(year);
};

const getCurrentAndNextAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  return [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ];
};

exports.createInscription = async (req, res) => {
  const { student, class: classId, academicYear } = req.body;
  const adminId = req.user._id;

  if (!adminId) {
    return res.status(403).json({ message: "Unauthorized access." });
  }

  if (!validateAcademicYear(academicYear)) {
    return res
      .status(400)
      .json({ message: "Invalid academic year format. Use YYYY-YYYY." });
  }

  const validAcademicYears = getCurrentAndNextAcademicYears();
  if (!validAcademicYears.includes(academicYear)) {
    return res
      .status(400)
      .json({
        message: "Academic year must be either the current year or next year.",
      });
  }

  try {
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(400).json({ message: "Student not found." });
    }    

    if (!studentExists.school || studentExists.school.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Unauthorized to manage this student." });
    }

    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: "Class not found." });
    }

    if (!classExists.school) {
      return res.status(400).json({ message: "Class does not have an associated school." });
    }
        
    if (classExists.school.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Unauthorized to create inscriptions for this class." });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(400).json({ message: "Admin not found." });
    }

    const newInscription = new Inscription({
      student,
      class: classId,
      academicYear,
      fees: admin.fees
    });

    const savedInscription = await newInscription.save();
    res.status(201).json(savedInscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllInscriptions = async (req, res) => {
  const adminId = req.user._id;
  try {
    const students = await Student.find({ school: adminId });
    const inscriptions = await Inscription.find({ student: { $in: students } })
      .populate("student")
      .populate("class");

    res.status(200).json(inscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInscriptionById = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;

  try {
    const inscription = await Inscription.findById(id)
      .populate("student")
      .populate("class");
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found." });
    }
    const student = await Student.findById(inscription.student);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.school.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Unauthorized to view this inscription." });
    }
    
    res.status(200).json(inscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInscription = async (req, res) => {
  const { id } = req.params;
  const { student, class: classId, academicYear } = req.body;
  const adminId = req.user._id;

  try {
    const inscription = await Inscription.findById(id).populate("student");
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found." });
    }

    if (academicYear) {
      if (!validateAcademicYear(academicYear)) {
        return res.status(400).json({ message: "Invalid academic year format. Use YYYY-YYYY." });
      }

      const validAcademicYears = getCurrentAndNextAcademicYears();
      if (!validAcademicYears.includes(academicYear)) {
        return res.status(400).json({ message: "Academic year must be either the current year or next year." });
      }

      inscription.academicYear = academicYear;
    }

    if (student) {
      const studentExists = await Student.findById(student);
      if (!studentExists) {
        return res.status(400).json({ message: "Student not found." });
      }

      if (studentExists.school.toString() !== adminId.toString()) {
        return res.status(403).json({ message: "Unauthorized to update this student." });
      }

      inscription.student = student;
    }

    if (classId) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(400).json({ message: "Class not found." });
      }

      if (classExists.school.toString() !== adminId.toString()) {
        return res.status(403).json({ message: "Unauthorized to update this class." });
      }

      inscription.class = classId;
    }

    const updatedInscription = await inscription.save();
    res.status(200).json(updatedInscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
;

exports.deleteInscription = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user._id;

  try {
    const inscription = await Inscription.findById(id);
    if (!inscription) {
      return res.status(404).json({ message: "Inscription not found." });
    }

    const student = await Student.findById(inscription.student);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    const parent = await Parent.findOne({ children: student._id });
    if (!student || student.school.toString() !== adminId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this inscription." });
    }

    const payment = await Payment.findOne({ inscription: id });

    if (payment) {
      await Payment.findByIdAndDelete(payment._id).exec();
    }

    await Inscription.findByIdAndDelete(id);

    student.isActive = false;
    await student.save();

    if (parent) {
      parent.isActive = false;
      await parent.save();
    }

    res.status(200).json({ message: "Inscription deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpiredInscriptions = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`;

    const expiredInscriptions = await Inscription.find({
      academicYear: { $lt: currentAcademicYear },
    });

    if (expiredInscriptions.length > 0) {
      for (let inscription of expiredInscriptions) {
        const payment = await Payment.findOne({ inscription: inscription._id });
        if (payment) {
          await Payment.findByIdAndDelete(payment._id).exec();
        }

        const student = await Student.findById(inscription.student);
        if (student) {
          student.isActive = false;
          await student.save();

          const parent = await Parent.findOne({ children: student._id });
          if (parent) {
            parent.isActive = false;
            await parent.save();
          }
        }

        await Inscription.findByIdAndDelete(inscription._id);
      }

      console.log("Expired inscriptions deleted successfully.");
    } else {
      console.log("No expired inscriptions found.");
    }
  } catch (error) {
    console.error("Error deleting expired inscriptions:", error.message);
  }
};
