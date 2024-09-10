const Class = require("../models/Class");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");

exports.createClass = async (req, res) => {
  try {
    const { className } = req.body;
    const adminId = req.user._id;
    if (!className) {
      return res.status(400).json({ message: "Class Name is required!" });
    }

    const newClass = new Class({
      className,
      school: adminId,
    });

    await newClass.save();
    res.status(201).json({ message: "Class created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating class!" });
  }
};

exports.listClasses = async (req, res) => {
  try {
    let classes = await Class.find({ school: req.user._id });
    if (classes.length > 0) {
      res.send(classes);
    } else {
      res.send({ message: "No classes found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error finding classes" });
  }
};

exports.listClassesTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;
    console.log(teacherId);

    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found!" });
    }

    const classes = await Class.find({ school: teacher.school });

    if (classes.length > 0) {
      return res.status(200).json(classes);
    } else {
      return res.status(404).json({ message: "No classes found!" });
    }
  } catch (error) {
    console.error("Error finding classes:", error);
    return res.status(500).json({ message: "Error finding classes" });
  }
};

exports.getclassDetail = async (req, res) => {
  try {
    let classe = await Class.findById(req.params.id)
      .populate("students", "name") 
      .populate("subjects.subjectId", "subName")
      .populate("subjects.teacherId", "name");
    if (!classe) {
      return res.status(404).json({ message: "No class found" });
    }

    if (classe.school._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this class" });
    }

    res.status(200).json(classe);
  } catch (error) {
    console.error("Error finding class:", error);
    res.status(500).json({ message: "Error finding class" });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }

    if (classData.school.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this class" });
    }
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: "Error Updating Class!" });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: "Class not found!" });
    }
    if (classData.school.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this class" });
    }
    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Class Deleted Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error Deleting Class!" });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required!" });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }

    if (classData.school.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to add students to this class",
        });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student Not Found!" });
    }

    if (student.school.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to add this student" });
    }

    if (!student.isActive) {
      return res.status(400).json({ error: "Student account is not active!" });
    }

    const existingClass = await Class.findOne({
      students: studentId,
      school: req.user._id,
    });
    if (existingClass) {
      return res
        .status(400)
        .json({ error: "Student is already in another class!" });
    }

    if (classData.students.length >= classData.nbrStudents.max) {
      return res.status(400).json({ error: "Class is full!" });
    }

    classData.students.push(studentId);
    await classData.save();

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ error: "Error adding student" });
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const adminId = req.user._id;
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required!" });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }
    if (classData.school.toString() !== adminId.toString()) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to remove students from this class",
        });
    }

    const studentIndex = classData.students.indexOf(studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ error: "Student Not Found in Class!" });
    }

    classData.students.splice(studentIndex, 1);
    classData.nbrStudents -= 1;
    await classData.save();

    res
      .status(200)
      .json({ message: "Student removed from class successfully!" });
  } catch (error) {
    console.error("Error removing student:", error);
    res.status(500).json({ error: "Error removing student" });
  }
};

exports.addSubject = async (req, res) => {
  try {
    const { subjectId, teacherId } = req.body;
    const adminId = req.user._id;

    if (!subjectId || !teacherId) {
      return res
        .status(400)
        .json({ error: "Subject ID and Teacher ID are required!" });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }

    if (classData.school.toString() !== adminId.toString()) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to add subjects to this class",
        });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher Not Found!" });
    }

    const teacherTeachesSubject =
      teacher.teachSubject.toString() === subjectId.toString();
    if (!teacherTeachesSubject) {
      return res
        .status(400)
        .json({ error: "Teacher does not teach this subject!" });
    }

    const existingSubject = classData.subjects.find(
      (subject) => subject.subjectId.toString() === subjectId.toString()
    );
    if (existingSubject) {
      return res
        .status(400)
        .json({ error: "Subject is already assigned to a teacher!" });
    }

    classData.subjects.push({ subjectId, teacherId });
    await classData.save();

    res.status(200).json(classData);
  } catch (error) {
    res.status(500).json({ error: "Error Adding Subject to Class" });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const adminId = req.user._id;
    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required!" });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }

    if (classData.school.toString() !== adminId.toString()) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to remove subjects from this class",
        });
    }

    const subjectIndex = classData.subjects.findIndex(
      (subject) => subject.subjectId.toString() === subjectId.toString()
    );
    if (subjectIndex === -1) {
      return res.status(404).json({ error: "Subject Not Found in Class!" });
    }

    classData.subjects.splice(subjectIndex, 1);
    await classData.save();

    res
      .status(200)
      .json({ message: "Subject removed from class successfully!" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: "Error deleting subject" });
  }
};

exports.listStudents = async (req, res) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      school: req.user._id,
    }).populate("students", "name email");
    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }

    if (classData.students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found in this class!" });
    }

    res.status(200).json(classData.students);
  } catch (error) {
    console.error("Error finding class students:", error);
    res.status(500).json({ error: "Error finding class students" });
  }
};

exports.changeTeacher = async (req, res) => {
  try {
    const { subjectId, newTeacherId } = req.body;
    const adminId = req.user._id;

    if (!subjectId || !newTeacherId) {
      return res
        .status(400)
        .json({ error: "Subject ID and new teacher ID are required" });
    }

    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: "Class Not Found" });
    }

    if (classData.school.toString() !== adminId.toString()) {
      return res
        .status(403)
        .json({
          error: "You are not authorized to change teachers for this class",
        });
    }

    const subjectIndex = classData.subjects.findIndex(
      (subject) => subject.subjectId.toString() === subjectId.toString()
    );

    if (subjectIndex === -1) {
      return res.status(404).json({ error: "Subject Not Found in Class!" });
    }
    console.log(subjectId);

    const newTeacher = await Teacher.findById(newTeacherId);
    if (!newTeacher) {
      return res.status(404).json({ error: "New Teacher Not Found" });
    }

    if (
      !newTeacher.school ||
      newTeacher.school.toString() !== adminId.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You are not authorized to assign this teacher" });
    }

    const teacherTeachesSubject =
      newTeacher.teachSubject.toString() === subjectId.toString();
    if (!teacherTeachesSubject) {
      return res
        .status(400)
        .json({ error: "New Teacher does not teach this subject!" });
    }

    classData.subjects[subjectIndex].teacherId = newTeacherId;
    await classData.save();

    await Course.updateMany(
      { classId: classData._id, subjectId: subjectId },
      { teacherId: newTeacherId }
    );

    res.status(200).json({ message: "Teacher changed successfully!" });
  } catch (error) {
    console.error("Error changing teacher:", error);
    res.status(500).json({ error: "Error changing teacher!" });
  }
};

exports.listTeachers = async (req, res) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      school: req.user._id,
    }).populate("subjects.teacherId", "name email");

    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }

    const teachers = classData.subjects.map((subject) => subject.teacherId);

    if (teachers.length === 0) {
      return res
        .status(404)
        .json({ message: "No teachers found for this class!" });
    }

    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error finding class teachers:", error);
    res.status(500).json({ error: "Error finding class teachers" });
  }
};

exports.listSubjects = async (req, res) => {
  try {
    const classData = await Class.findOne({
      _id: req.params.id,
      school: req.user._id,
    }).populate("subjects.subjectId", "subName");

    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }

    const subjects = classData.subjects.map((subject) => subject.subjectId);

    if (subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No subjects found for this class!" });
    }

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error finding class subjects:", error);
    res.status(500).json({ error: "Error finding class subjects" });
  }
};

exports.transferStudent = async (req, res) => {
  try {
    const { studentId, currentClassId, newClassId } = req.body;
    const adminId = req.user._id;

    if (!studentId || !currentClassId || !newClassId) {
      return res
        .status(400)
        .json({
          error: "Student ID, currentClass ID, and newClass ID are required!",
        });
    }

    const currentClass = await Class.findById(currentClassId);
    const newClass = await Class.findById(newClassId);

    if (!currentClass || !newClass) {
      return res.status(404).json({ error: "One or both classes not found!" });
    }

    if (
      currentClass.school.toString() !== adminId.toString() ||
      newClass.school.toString() !== adminId.toString()
    ) {
      return res
        .status(403)
        .json({
          message:
            "You are not authorized to transfer students between these classes",
        });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found!" });
    }
    if (student.school.toString() !== adminId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to transfer this student" });
    }

    const studentIndex = currentClass.students.indexOf(studentId);
    if (studentIndex === -1) {
      return res
        .status(400)
        .json({ error: "Student is not in the fromClass!" });
    }

    if (newClass.students.includes(studentId)) {
      return res
        .status(400)
        .json({ error: "Student is already in the toClass!" });
    }

    currentClass.students.splice(studentIndex, 1);
    newClass.students.push(studentId);

    await currentClass.save();
    await newClass.save();

    res.status(200).json({ message: "Student transferred successfully!" });
  } catch (error) {
    console.error("Error transferring student:", error);
    res.status(500).json({ error: "Error transferring student!" });
  }
};

exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params; 
    const teacherId = req.user._id; 

    const classData = await Class.findOne({ 
      _id: classId, 
      school: req.user.school 
    }).populate('students', 'name email'); 

    if (!classData) {
      return res.status(404).json({ error: "Class Not Found!" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher Not Found!" });
    }

    if (teacher.school.toString() !== classData.school.toString()) {
      return res.status(403).json({ error: "You are not authorized to view students in this class!" });
    }

    res.status(200).json(classData.students);
  } catch (error) {
    console.error("Error finding class students:", error);
    res.status(500).json({ error: "Error finding class students" });
  }
};
