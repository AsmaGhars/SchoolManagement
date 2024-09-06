const mongoose = require('mongoose');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

exports.createTimetableForClass = async (req, res) => {
    try {
        const { classId } = req.body;
        const adminId = req.user._id; 

        if (!classId) {
            return res.status(400).json({ message: "Class ID is required!" });
        }

        const classObj = await Class.findOne({ _id: classId, school: adminId });
        if (!classObj) {
            return res.status(403).json({ message: "Unauthorized to create timetable for this class!" });
        }

        const courses = await Course.find({ classId: new mongoose.Types.ObjectId(classId) });
        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found for this class!" });
        }

        const existingTimetable = await Timetable.findOne({ classId: new mongoose.Types.ObjectId(classId) });

        if (existingTimetable) {
            existingTimetable.courses = courses.map(course => course._id);
            await existingTimetable.save();
            res.status(200).json({ message: "Timetable updated successfully for the class!", timetable: existingTimetable });
        } else {
            const newTimetable = new Timetable({
                classId: new mongoose.Types.ObjectId(classId),
                courses: courses.map(course => course._id)
            });
            const savedTimetable = await newTimetable.save();
            res.status(201).json({ message: "Timetable created successfully for the class!", timetable: savedTimetable });
        }
    } catch (error) {
        console.error("Error creating timetable for class:", error);
        res.status(500).json({ message: "Error creating timetable for class!" });
    }
};

exports.getTimetableForClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: "Invalid class ID format!" });
        }

        const student = await Student.findById(userId);
        if (student && !student.isActive) {
            return res.status(403).json({ message: "Student's account is not active!" });
        }

        const classObj = await Class.findById(classId).populate('students school');
        if (!classObj) {
            return res.status(404).json({ message: "Class not found!" });
        }

        if (classObj.school._id.equals(userId) || classObj.students.some(student => student._id.equals(userId))) {
            const timetable = await Timetable.findOne({ classId: new mongoose.Types.ObjectId(classId) })
                .populate({
                    path: 'courses',
                    populate: [
                        { path: 'subjectId', select: 'subName' },
                        { path: 'teacherId', select: 'name' },
                        { path: 'classroomId', select: 'name' }
                    ]
                })
                .populate('classId', 'className');

            if (!timetable) {
                return res.status(404).json({ message: "Timetable not found for this class!" });
            }

            const formattedTimetable = timetable.courses.map(course => ({
                subject: course.subjectId.subName,
                classroom: course.classroomId.name,
                teacher: course.teacherId.name,
                day: course.day,
                startTime: course.startTime,
                endTime: course.endTime
            }));

            return res.status(200).json({ timetable: formattedTimetable });

        } else {
            return res.status(403).json({ message: "Access denied!" });
        }

    } catch (error) {
        console.error("Error retrieving timetable for class:", error);
        return res.status(500).json({ message: "Error retrieving timetable for class!" });
    }
};

exports.getTimetableForClassStudent = async (req, res) => {
    try {
        const studentId = req.user._id;

        const classObj = await Class.findOne({ students: studentId });
        if (!classObj) {
            return res.status(404).json({ message: "Class not found for the student!" });
        }
        
        const classId = classObj._id;

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: "Invalid class ID format!" });
        }

        const student = await Student.findById(studentId);
        if (student && !student.isActive) {
            return res.status(403).json({ message: "Student's account is not active!" });
        }

        if (classObj.students.some(student => student._id.equals(studentId))) {
            const timetable = await Timetable.findOne({ classId: new mongoose.Types.ObjectId(classId) })
                .populate({
                    path: 'courses',
                    populate: [
                        { path: 'subjectId', select: 'subName' },
                        { path: 'teacherId', select: 'name' },
                        { path: 'classroomId', select: 'name' }
                    ]
                })
                .populate('classId', 'className');

            if (!timetable) {
                return res.status(404).json({ message: "Timetable not found for this class!" });
            }

            const formattedTimetable = timetable.courses.map(course => ({
                subject: course.subjectId.subName,
                classroom: course.classroomId.name,
                teacher: course.teacherId.name,
                day: course.day,
                startTime: course.startTime,
                endTime: course.endTime
            }));

            return res.status(200).json({ timetable: formattedTimetable });

        } else {
            return res.status(403).json({ message: "Access denied!" });
        }

    } catch (error) {
        console.error("Error retrieving timetable for class:", error);
        return res.status(500).json({ message: "Error retrieving timetable for class!" });
    }
};

exports.getAllClassTimetables = async (req, res) => {
    try {
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ message: "Invalid admin ID format!" });
        }

        const classes = await Class.find({ school: adminId }, 'className');
        if (classes.length === 0) {
            return res.status(404).json({ message: "No classes found for this admin!" });
        }

        const formattedTimetables = [];

        for (const classe of classes) {
            const timetables = await Timetable.find({ classId: classe._id })
                .populate({
                    path: 'courses',
                    populate: [
                        { path: 'subjectId', select: 'subName' },
                        { path: 'classroomId', select: 'name' },
                        { path: 'teacherId', select: 'name' }
                    ]
                })
                .populate('classId', 'className');

            if (timetables.length > 0) {
                timetables.forEach(timetable => {
                    const formattedCourses = timetable.courses.map(course => ({
                        subject: course.subjectId ? course.subjectId.subName : "Unknown",
                        classroom: course.classroomId ? course.classroomId.name : "Unknown",
                        day: course.day || "Unknown",
                        startTime: course.startTime || "Unknown",
                        endTime: course.endTime || "Unknown"
                    }));

                    formattedTimetables.push({
                        className: timetable.classId ? timetable.classId.className : "Unknown",
                        courses: formattedCourses
                    });
                });
            } else {
                formattedTimetables.push({
                    className: classe.className,
                    courses: []
                });
            }
        }

        if (formattedTimetables.length === 0) {
            return res.status(404).json({ message: "No timetables found for these classes!" });
        }

        res.status(200).json({ timetables: formattedTimetables });

    } catch (error) {
        console.error("Error retrieving all classes' timetables:", error);
        res.status(500).json({ message: "Error retrieving all classes' timetables!" });
    }
};

exports.createTimetableForTeacher = async (req, res) => {
    try {
        const { teacherId } = req.body;
        const adminId = req.user._id;

        
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ message: "Invalid teacher ID format!" });
        }

        if (!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required!" });
        }

        const teacherExists = await Teacher.exists({ _id: teacherId, school: adminId });
        if (!teacherExists) {
            return res.status(404).json({ message: `Teacher with ID ${teacherId} not found!` });
        }

        const courses = await Course.find({ teacherId: new mongoose.Types.ObjectId(teacherId) });

        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found for this teacher!" });
        }

        const existingTimetable = await Timetable.findOne({ teacherId: new mongoose.Types.ObjectId(teacherId) });

        
        if (existingTimetable) {
            existingTimetable.courses = courses.map(course => course._id);
            await existingTimetable.save();
            res.status(200).json({ message: "Timetable updated successfully for the teacher!", timetable: existingTimetable });
        } else {
            const newTimetable = new Timetable({
                teacherId: new mongoose.Types.ObjectId(teacherId),
                courses: courses.map(course => course._id)
            });
            const savedTimetable = await newTimetable.save();
            res.status(201).json({ message: "Timetable created successfully for the teacher!", timetable: savedTimetable });
        }
    } catch (error) {
        console.error("Error creating timetable for teacher:", error);
        res.status(500).json({ message: "Error creating timetable for teacher!" });
    }
};

exports.getTimetableForTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ message: "Invalid teacher ID format!" });
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found!" });
        }

        if (!userId.equals(teacher._id) && !userId.equals(teacher.school)) {
            return res.status(403).json({ message: "Access denied!" });
        }

        const courses = await Course.find({ teacherId: teacherId })
            .populate({
                path: 'subjectId',
                select: 'subName'
            })
            .populate({
                path: 'classroomId',
                select: 'name'
            })
            .populate({
                path: 'classId', 
                select: 'className'
            });

        if (courses.length === 0) {
            return res.status(404).json({ message: "No timetable found for this teacher!" });
        }

        const formattedTimetables = courses.map(course => ({
            className: course.classId ? course.classId.className : "Unknown",
            courses: [{
                subject: course.subjectId ? course.subjectId.subName : "Unknown",
                classroom: course.classroomId ? course.classroomId.name : "Unknown",
                day: course.day || "Unknown",
                startTime: course.startTime || "Unknown",
                endTime: course.endTime || "Unknown"
            }]
        }));

        res.status(200).json({ timetables: formattedTimetables });

    } catch (error) {
        console.error("Error retrieving timetable for teacher:", error);
        res.status(500).json({ message: "Error retrieving timetable for teacher!" });
    }
};

exports.getTimetableTeacher = async (req, res) => {
    try {
        const teacherId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ message: "Invalid teacher ID format!" });
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found!" });
        }

        const courses = await Course.find({ teacherId: teacherId })
            .populate({
                path: 'subjectId',
                select: 'subName'
            })
            .populate({
                path: 'classroomId',
                select: 'name'
            })
            .populate({
                path: 'classId', 
                select: 'className'
            });

        if (courses.length === 0) {
            return res.status(404).json({ message: "No timetable found for this teacher!" });
        }

        const formattedTimetables = courses.map(course => ({
            className: course.classId ? course.classId.className : "Unknown",
            subject: course.subjectId ? course.subjectId.subName : "Unknown",
            classroom: course.classroomId ? course.classroomId.name : "Unknown",
            day: course.day || "Unknown",
            startTime: course.startTime || "Unknown",
            endTime: course.endTime || "Unknown"
        }));

        res.status(200).json({ timetables: formattedTimetables });

    } catch (error) {
        console.error("Error retrieving timetable for teacher:", error);
        res.status(500).json({ message: "Error retrieving timetable for teacher!" });
    }
};

exports.getAllTeachersTimetables = async (req, res) => {
    try {
        const adminId = req.user._id;

        const teachers = await Teacher.find({ school: adminId });

        if (teachers.length === 0) {
            return res.status(404).json({ message: "No teachers found for this admin!" });
        }

        const teacherIds = teachers.map(teacher => teacher._id);

        const courses = await Course.find({ teacherId: { $in: teacherIds } })
            .populate({
                path: 'subjectId',
                select: 'subName'
            })
            .populate({
                path: 'classroomId',
                select: 'name'
            })
            .populate({
                path: 'classId',  
                select: 'className'
            });

        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found for teachers!" });
        }

        const timetableMap = courses.reduce((acc, course) => {
            const classId = course.classId ? course.classId._id.toString() : "Unknown";
            if (!acc[classId]) {
                acc[classId] = {
                    className: course.classId ? course.classId.className : "Unknown",
                    courses: []
                };
            }
            acc[classId].courses.push({
                subject: course.subjectId ? course.subjectId.subName : "Unknown",
                classroom: course.classroomId ? course.classroomId.name : "Unknown",
                day: course.day || "Unknown",
                startTime: course.startTime || "Unknown",
                endTime: course.endTime || "Unknown"
            });
            return acc;
        }, {});

        const formattedTimetables = Object.values(timetableMap);

        res.status(200).json({ timetables: formattedTimetables });

    } catch (error) {
        console.error("Error retrieving all teachers' timetables:", error);
        res.status(500).json({ message: "Error retrieving all teachers' timetables!" });
    }
};

exports.createTimetablesForAllTeachers = async (req, res) => {
    try {
        const adminId = req.user._id;

        const teachers = await Teacher.find({ school: adminId });

        if (teachers.length === 0) {
            return res.status(404).json({ message: "No teachers found for this admin!" });
        }

        for (const teacher of teachers) {
            const courses = await Course.find({ teacherId: teacher._id });

            if (courses.length === 0) {
                continue;
            }

            const existingTimetable = await Timetable.findOne({ teacherId: teacher._id });

            if (existingTimetable) {
                existingTimetable.courses = courses.map(course => course._id);
                await existingTimetable.save();
            } else {
                const newTimetable = new Timetable({
                    teacherId: teacher._id,
                    courses: courses.map(course => course._id),
                });
                await newTimetable.save();
            }
        }

        res.status(200).json({ message: "Timetables created/updated for all teachers!" });

    } catch (error) {
        console.error("Error creating timetables for all teachers:", error);
        res.status(500).json({ message: "Error creating timetables for all teachers!" });
    }
};


exports.createTimetablesForAllClasses = async (req, res) => {
    try {
        const adminId = req.user._id;

        const classes = await Class.find({ school: adminId });

        if (classes.length === 0) {
            return res.status(404).json({ message: "No classes found for this admin!" });
        }

        for (const classObj of classes) {
            const courses = await Course.find({
                classId: classObj._id,
                teacherId: { $in: await Teacher.find({ school: adminId }).select('_id') }
            });

            const existingTimetable = await Timetable.findOne({ classId: classObj._id });

            if (existingTimetable) {
                existingTimetable.courses = courses.map(course => course._id);
                await existingTimetable.save();
            } else {
                const newTimetable = new Timetable({
                    classId: classObj._id,
                    courses: courses.map(course => course._id)
                });
                await newTimetable.save();
            }
        }

        res.status(200).json({ message: "Timetables created/updated successfully for all classes!" });

    } catch (error) {
        console.error("Error creating/updating timetables for all classes:", error);
        res.status(500).json({ message: "Error creating/updating timetables for all classes!" });
    }
};


exports.deleteTimetableForClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: "Invalid class ID format!" });
        }

        const classObj = await Class.findOne({ _id: classId, school: adminId });

        if (!classObj) {
            return res.status(403).json({ message: "You are not authorized to delete the timetable for this class!" });
        }

        const result = await Timetable.deleteOne({ classId: classId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Timetable for this class not found!" });
        }

        res.status(200).json({ message: "Timetable for class deleted successfully!" });
    } catch (error) {
        console.error("Error deleting timetable for class:", error);
        res.status(500).json({ message: "Error deleting timetable for class!" });
    }
};

exports.deleteTimetableForTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const adminId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ message: "Invalid teacher ID format!" });
        }

        const teacher = await Teacher.findOne({ _id: teacherId, school: adminId });

        if (!teacher) {
            return res.status(403).json({ message: "You are not authorized to delete the timetable for this teacher!" });
        }

        const result = await Timetable.deleteOne({ teacherId: teacherId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Timetable for this teacher not found!" });
        }

        res.status(200).json({ message: "Timetable for teacher deleted successfully!" });
    } catch (error) {
        console.error("Error deleting timetable for teacher:", error);
        res.status(500).json({ message: "Error deleting timetable for teacher!" });
    }
};

