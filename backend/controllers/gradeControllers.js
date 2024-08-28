const Grade = require("../models/Grade");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Student = require("../models/Student");

exports.saveGrades = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { classId, trimester, grades } = req.body;

    const teacher = await Teacher.findById(teacherId).populate("school");
    if (!teacher || !teacher.school) {
      return res.status(404).json({ message: "Teacher or school not found" });
    }

    const classData = await Class.findById(classId).populate(
      "subjects.subjectId"
    );
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classData.school._id.toString() !== teacher.school._id.toString()) {
      return res
        .status(400)
        .json({ message: "Class does not belong to the teacher's school" });
    }

    const validStudentIds = new Set(
      classData.students.map((id) => id.toString())
    );

    const subject = classData.subjects.find((s) =>
      s.teacherId.equals(teacherId)
    );
    if (!subject) {
      return res
        .status(403)
        .json({ message: "You are not authorized to grade this class." });
    }

    for (let gradeEntry of grades) {
      const { studentId, controleGrade, syntheseGrade } = gradeEntry;

      if (!validStudentIds.has(studentId.toString())) {
        return res.status(400).json({
          message: `Student with ID ${studentId} is not enrolled in this class.`,
        });
      }

      let grade = await Grade.findOne({
        studentId,
        subjectId: subject.subjectId._id,
        trimester,
      });

      if (grade) {
        if (controleGrade !== undefined) grade.controleGrade = controleGrade;
        if (syntheseGrade !== undefined) grade.syntheseGrade = syntheseGrade;
      } else {
        grade = new Grade({
          studentId,
          subjectId: subject.subjectId._id,
          trimester,
          controleGrade,
          syntheseGrade,
        });
      }

      await grade.save();
    }

    res.status(200).json({ message: "Grades saved successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error saving grades", error });
  }
};

exports.updateGrades = async (req, res) => {
  try {
    const classId = req.params.classId;
    const teacherId = req.user._id;
    const { trimester, grades } = req.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const classData = await Class.findById(classId)
      .populate("students")
      .populate("subjects.subjectId");
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classData.school.toString() !== teacher.school.toString()) {
      return res
        .status(400)
        .json({ message: "Class does not belong to the teacher" });
    }

    const subject = classData.subjects.find((s) =>
      s.teacherId.equals(teacherId)
    );
    if (!subject) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to update grades for this class.",
        });
    }

    const validStudentIds = new Set(
      classData.students.map((student) => student._id.toString())
    );

    for (let gradeEntry of grades) {
      const { studentId, controleGrade, syntheseGrade } = gradeEntry;

      if (!validStudentIds.has(studentId.toString())) {
        return res
          .status(400)
          .json({
            message: `Student with ID ${studentId} is not enrolled in this class.`,
          });
      }

      const grade = await Grade.findOne({
        studentId,
        subjectId: subject.subjectId._id,
        trimester,
      });

      if (grade) {
        if (controleGrade !== undefined) grade.controleGrade = controleGrade;
        if (syntheseGrade !== undefined) grade.syntheseGrade = syntheseGrade;
        await grade.save();
      } else {
        return res
          .status(404)
          .json({
            message: `Grade record not found for student ${studentId}.`,
          });
      }
    }

    res.status(200).json({ message: "Grades updated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error updating grades", error });
  }
};

exports.deleteGrades = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { classId, trimester } = req.query;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const classData = await Class.findById(classId).populate(
      "subjects.subjectId"
    );
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classData.school._id.toString() !== teacher.school._id.toString()) {
      return res
        .status(400)
        .json({ message: "Class does not belong to the teacher" });
    }

    const subject = classData.subjects.find((s) =>
      s.teacherId.equals(teacherId)
    );
    if (!subject) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to delete grades for this class.",
        });
    }

    const result = await Grade.deleteMany({
      subjectId: subject.subjectId._id,
      trimester: trimester,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No grades found to delete." });
    }

    res.status(200).json({ message: "Grades deleted successfully." });
  } catch (error) {
    console.error("Error deleting grades:", error);
    res.status(500).json({ message: "Error deleting grades", error });
  }
};

exports.getAllGrades = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { classId, trimester } = req.query;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const classData = await Class.findById(classId).populate(
      "subjects.subjectId"
    );
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classData.school.toString() !== teacher.school.toString()) {
      return res
        .status(400)
        .json({ message: "Class does not belong to the teacher" });
    }

    const subject = classData.subjects.find((s) =>
      s.teacherId.equals(teacherId)
    );
    if (!subject) {
      return res.status(403).json({
        message: "You are not authorized to view grades for this class.",
      });
    }

    const grades = await Grade.find({
      subjectId: subject.subjectId._id,
      trimester,
    }).populate("studentId", "name");

    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving grades", error });
  }
};

exports.getGradesForStudent = async (req, res) => {
  try {
    const adminId = req.user._id;
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (adminId.toString() !== student.school.toString())
    {
      return res.status(400).json({ message: "Student does not belong to the school"});
    }
    const grades = await Grade.find({ studentId }).populate("subjectId", "subName");
    res.status(200).json(grades);
  } catch (error) {
    console.error("Error retrieving grades:", error);
    res.status(500).json({ message: "Error retrieving grades", error });
  }
};



