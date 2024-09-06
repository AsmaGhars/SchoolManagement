const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Absence = require("../models/Absence");
const Course = require("../models/Course");
const Class = require("../models/Class");
const Admin = require("../models/Admin");

exports.recordAbsence = async (req, res) => {
  const { studentId, status } = req.body;
  const teacherId = req.user._id;

  try {
    const teacher = await Teacher.findById(teacherId);
    const student = await Student.findById(studentId);

    if (!teacher || !student) {
      return res.status(404).json({ message: "Teacher or student not found" });
    }

    if (!student.isActive) {
      return res.status(400).json({ message: "Student account is not active" });
    }

    if (teacher.school.toString() !== student.school.toString()) {
      return res
        .status(400)
        .json({ message: "Teacher and student are not in the same school" });
    }

    const options = { weekday: "long", timeZone: "Africa/Tunis" };
    const currentDay = new Date().toLocaleString("en-US", options);
    const currentTime = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Africa/Tunis",
    });    

    const course = await Course.findOne({
      teacherId,
      day: currentDay,
      startTime: { $lte: currentTime },
      endTime: { $gte: currentTime }
    });

    if (!course) {
      return res.status(400).json({ message: "No matching course found for the current time." });
    }

    const classInCourse = await Class.findById(course.classId);
    if (!classInCourse) {
      return res.status(404).json({ message: "Class associated with the course not found" });
    }

    if (!classInCourse.students.includes(studentId)) {
      return res.status(400).json({ message: "Student is not enrolled in the class for this course" });
    }

    const absence = new Absence({
      studentId,
      courseId: course._id,
      date: new Date(absence.date).toISOString(),
      status: status || "Absent",
    });

    await absence.save();
    res
      .status(201)
      .json({ message: "Absence recorded successfully.", absence });
  } catch (error) {
    res.status(500).json({ message: "Error recording absence.", error });
  }
};

exports.getStudentAbsences = async (req, res) => {
  const { studentId } = req.params;
  const userId = req.user._id; 

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const classes = await Class.find({ students: studentId });
    if (classes.length === 0) {
      return res.status(404).json({ message: "No classes found for this student." });
    }

    const userIsAdmin = await Admin.findById(userId);
    if (userIsAdmin) {
      if (userId.toString() !== student.school.toString()) {
        return res.status(403).json({ message: "Access denied. Admin does not manage this student's school." });
      }
  
      const absences = await Absence.find({ studentId }).populate('courseId');
      return res.status(200).json(absences);
    }

    const teacher = await Teacher.findById(userId);
    if (teacher) {
      const courses = await Course.find({
        teacherId: userId,
        classId: { $in: classes.map(cls => cls._id) }
      });
  
      if (courses.length === 0) {
        return res.status(403).json({ message: "Access denied. Teacher does not teach this student." });
      }

      const absences = await Absence.find({
        studentId,
        courseId: { $in: courses.map(course => course._id) }
      }).populate('courseId');
  
      if (absences.length === 0) {
        return res.status(200).json([]); 
    }

      return res.status(200).json(absences);
    }

    return res.status(403).json({ message: "Access denied." });

  } catch (error) {
    return res.status(500).json({ message: "Error fetching absences.", error });
  }
};


exports.updateAbsenceStatus = async (req, res) => {
  const { absenceId } = req.params;
  const { status } = req.body;
  const userId = req.user._id;

  try {
    const validStatuses = ["Absent", "Present", "Excused"]; 
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const absence = await Absence.findById(absenceId);
    if (!absence) {
      return res.status(404).json({ message: "Absence not found" });
    }

    const teacher = await Teacher.findById(userId);
    if(!teacher){
      return res.status(403).json({ message: "Access denied. Only teachers can update absence"});
    }
    const course = await Course.findById(absence.courseId);
    if(!course){
      return res.status(403).json({ message: "Access denied. Course does not exist."});
    }
    if (teacher && teacher._id.toString() !== course.teacherId.toString()) {
      return res.status(403).json({ message: "Access denied. Teacher cannot update this absence." });
    }

    absence.status = status;
    await absence.save();

    res.status(200).json({ message: "Absence status updated.", absence });
  } catch (error) {
    res.status(500).json({ message: "Error updating absence status.", error });
  }
};

exports.deleteAbsence = async (req, res) => {
  const { absenceId } = req.params;
  const userId = req.user._id;

  try {
    const absence = await Absence.findById(absenceId);
    if (!absence) {
      return res.status(404).json({ message: "Absence not found" });
    }

    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      return res.status(403).json({ message: "Access denied. Only teachers can delete absence records." });
    }

    const course = await Course.findById(absence.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (teacher._id.toString() !== course.teacherId.toString()) {
      return res.status(403).json({ message: "Access denied. Teacher cannot delete this absence." });
    }

    await Absence.findByIdAndDelete(absenceId);

    res.status(200).json({ message: "Absence deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting absence.", error });
  }
};
