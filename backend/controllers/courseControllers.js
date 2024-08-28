const mongoose = require("mongoose");
const Course = require('../models/Course');
const Class = require('../models/Class');
const ObjectId = mongoose.Types.ObjectId;
const Classroom = require('../models/Classroom');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');


const capitalizeName = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

exports.createCourse = async (req, res) => {
    try {
        const adminId = req.user._id; 
        const { classId, subjectId, classroomId, day, startTime, endTime } = req.body;

        if (!classId || !subjectId || !classroomId || !day || !startTime || !endTime) {
            return res.status(400).json({ message: "Class ID, Subject ID, Classroom ID, Day, Start Time, and End Time are required!" });
        }

        const standardizedDay = capitalizeName(day.trim());

        const classData = await Class.findOne({ _id: classId, school: adminId });
        if (!classData) {
            return res.status(403).json({ message: "You do not own this class!" });
        }

        const subjectData = await Subject.findOne({ _id: subjectId, school: adminId });
        if (!subjectData) {
            return res.status(403).json({ message: "You do not own this subject!" });
        }

        const classroomData = await Classroom.findOne({ _id: classroomId, school: adminId });
        if (!classroomData) {
            return res.status(403).json({ message: "You do not own this classroom!" });
        }

        const subjectEntry = classData.subjects.find(sub => sub.subjectId.toString() === subjectId.toString());
        if (!subjectEntry) {
            return res.status(404).json({ message: "Subject not associated with this class!" });
        }

        const teacherId = subjectEntry.teacherId;

        const conflictingCourse = await Course.findOne({
            $and: [
                { day: standardizedDay },
                { $or: [
                    { teacherId: teacherId },
                    { classroomId: classroomId },
                    { classId: classId }
                ] },
                { $or: [
                    { startTime: { $lt: endTime, $gte: startTime } },
                    { endTime: { $gt: startTime, $lte: endTime } }
                ] }
            ]
        });

        if (conflictingCourse) {
            return res.status(400).json({ message: "Conflict detected: Teacher, classroom, or class already has a course at this time!" });
        }

        const newCourse = new Course({
            classId,
            subjectId,
            teacherId,
            classroomId,
            day: standardizedDay,
            startTime,
            endTime,
            school: adminId 
        });

        const savedCourse = await newCourse.save();
        res.status(201).json({ message: "Course created successfully!", course: savedCourse });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating course!" });
    }
};
exports.listCourses = async (req, res) => {
    try {
        const adminId = req.user._id;
        const courses = await Course.find({ school: adminId })
            .populate('classId', 'className') 
            .populate('subjectId', 'subName') 
            .populate('teacherId', 'name') 
            .populate('classroomId', 'name') 
            .populate('startTime', 'startTime')
            .populate('endTime', 'endTime')
            .populate('day', 'day');


        const formattedCourses = courses.map(course => ({
            class: course.classId ? course.classId.className : 'Unknown Class',
            subject: course.subjectId ? course.subjectId.subName : 'Unknown Subject',
            teacher: course.teacherId ? course.teacherId.name : 'Unknown Teacher',
            classroom: course.classroomId ? course.classroomId.name : 'Unknown Classroom',
            startTime: course.startTime ? course.startTime: 'Unknown startTime',
            endTime: course.endTime ? course.endTime: 'Unknown endTime',
            day: course.day ? course.day: 'Unkoun day'

        }));

        res.status(200).json(formattedCourses);
    } catch (error) {
        console.error("Error retrieving courses:", error);
        res.status(500).json({ message: "Error retrieving courses!" });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const adminId = req.user._id;
        const course = await Course.findOne({ _id: req.params.id, school: adminId })
            .populate('classId', 'className') 
            .populate('subjectId', 'subName') 
            .populate('teacherId', 'name') 
            .populate('classroomId', 'name');
        
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }

        res.status(200).json({
            class: course.classId ? course.classId.className : 'Unknown Class',
            subject: course.subjectId ? course.subjectId.subName : 'Unknown Subject',
            teacher: course.teacherId ? course.teacherId.name : 'Unknown Teacher',
            classroom: course.classroomId ? course.classroomId.name : 'Unknown Classroom',
            startTime: course.startTime || 'Unknown startTime',
            endTime: course.endTime || 'Unknown endTime',
            day: course.day || 'Unknown day'
        });
    } catch (error) {
        console.error("Error retrieving course:", error);
        res.status(500).json({ message: "Error retrieving course!" });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const adminId = req.user._id; 
        const { id } = req.params; 
        const { classId, subjectId, classroomId, day, startTime, endTime } = req.body;

        if (!classId || !subjectId || !classroomId || !day || !startTime || !endTime) {
            return res.status(400).json({ message: "Class ID, Subject ID, Classroom ID, Day, Start Time, and End Time are required!" });
        }

        const standardizedDay = capitalizeName(day.trim());  

        const existingCourse = await Course.findOne({ _id: id, school: adminId });
        if (!existingCourse) {
            return res.status(404).json({ message: "Course not found or you do not have access to update this course!" });
        }

        const classData = await Class.findOne({ _id: classId, school: adminId });
        if (!classData) {
            return res.status(404).json({ message: "Class not found or you do not have access to this class!" });
        }

        const subjectEntry = classData.subjects.find(sub => sub.subjectId.toString() === subjectId.toString());
        if (!subjectEntry) {
            return res.status(404).json({ message: "Subject not associated with this class or you do not have access to this subject!" });
        }

        const classroomData = await Classroom.findOne({ _id: classroomId, school: adminId });
        if (!classroomData) {
            return res.status(404).json({ message: "Classroom not found or you do not have access to this classroom!" });
        }

        const teacherId = subjectEntry.teacherId;

        const conflictingCourse = await Course.findOne({
            _id: { $ne: id }, 
            school: adminId,
            $and: [
                { day: standardizedDay },
                { $or: [
                    { teacherId: teacherId },
                    { classroomId: classroomId },
                    { classId: classId }
                ] },
                { $or: [
                    { startTime: { $lt: endTime, $gte: startTime } },
                    { endTime: { $gt: startTime, $lte: endTime } }
                ] }
            ]
        });

        if (conflictingCourse) {
            return res.status(400).json({ message: "Conflict detected: Teacher, classroom, or class already has a course at this time!" });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            {
                classId,
                subjectId,
                teacherId,
                classroomId,
                day: standardizedDay,
                startTime,
                endTime
            },
            { new: true }
        );

        res.status(200).json({ message: "Course updated successfully!", course: updatedCourse });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: "Error updating course!" });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const adminId = req.user._id;
        const deletedCourse = await Course.findOneAndDelete({ _id: req.params.id, school: adminId });

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found or you do not have access to this course!" });
        }

        res.status(200).json({ message: "Course deleted successfully!" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Error deleting course!" });
    }
};


exports.listCoursesByTeacher = async (req, res) => {
    try {
        const adminId = req.user._id;
        const teacherId = req.params.teacherId;
        
        if (!ObjectId.isValid(teacherId)) {
            return res.status(400).json({ message: "Invalid teacher ID format!" });
        }

        const teacher = await Teacher.findOne({ _id: teacherId, school: adminId });
        if (!teacher) {
            return res.status(403).json({ message: "You do not have access to this teacher!" });
        }

        const courses = await Course.find({ teacherId: new ObjectId(teacherId), school: adminId })
            .populate('classId', 'className')
            .populate('subjectId', 'subName')
            .populate('teacherId', 'name')
            .populate('classroomId', 'name');

        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found for this teacher in your school!" });
        }

        const formattedCourses = courses.map(course => ({
            class: course.classId ? course.classId.className : 'Unknown Class',
            subject: course.subjectId ? course.subjectId.subName : 'Unknown Subject',
            teacher: course.teacherId ? course.teacherId.name : 'Unknown Teacher',
            classroom: course.classroomId ? course.classroomId.name : 'Unknown Classroom',
            startTime: course.startTime || 'Unknown startTime',
            endTime: course.endTime || 'Unknown endTime',
            day: course.day || 'Unknown day'
        }));

        res.status(200).json(formattedCourses);
    } catch (error) {
        console.error("Error retrieving courses by teacher:", error);
        res.status(500).json({ message: "Error retrieving courses by teacher!" });
    }
};

exports.listCoursesByClass = async (req, res) => {
    try {
        const adminId = req.user._id; 
        const { classId } = req.params; 
        const classData = await Class.findOne({ _id: classId, school: adminId });
        if (!classData) {
            return res.status(404).json({ message: "Class not found or you do not have access to this class!" });
        }

        const courses = await Course.find({ classId, school: adminId });

        res.status(200).json({ courses });
    } catch (error) {
        console.error("Error listing courses by class:", error);
        res.status(500).json({ message: "Error listing courses by class!" });
    }
};


exports.listCoursesBySubject = async (req, res) => {
    try {
        const adminId = req.user._id; 
        const { subjectId } = req.params; 

        if (!ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: "Invalid subject ID format!" });
        }

        const subjectData = await Subject.findOne({ _id: subjectId, school: adminId });
        if (!subjectData) {
            return res.status(404).json({ message: "Subject not found or you do not have access to this subject!" });
        }

        const courses = await Course.find({ subjectId, school: adminId })
            .populate('classId', 'className') 
            .populate('teacherId', 'name') 
            .populate('classroomId', 'name');

        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found for this subject in your school!" });
        }

        const formattedCourses = courses.map(course => ({
            class: course.classId ? course.classId.className : 'Unknown Class',
            subject: course.subjectId ? course.subjectId.subName : 'Unknown Subject',
            teacher: course.teacherId ? course.teacherId.name : 'Unknown Teacher',
            classroom: course.classroomId ? course.classroomId.name : 'Unknown Classroom',
            startTime: course.startTime || 'Unknown startTime',
            endTime: course.endTime || 'Unknown endTime',
            day: course.day || 'Unknown day'
        }));

        res.status(200).json(formattedCourses);
    } catch (error) {
        console.error("Error retrieving courses by subject:", error);
        res.status(500).json({ message: "Error retrieving courses by subject!" });
    }
};


exports.listEmptyClassrooms = async (req, res) => {
    try {
        const adminId = req.user._id;
        const { day, startTime, endTime } = req.body;

        if (!day || !startTime || !endTime) {
            return res.status(400).json({ message: "Day, Start Time, and End Time are required!" });
        }

        const standardizedDay = capitalizeName(day.trim()); 

        const classroomsOwnedByAdmin = await Classroom.find({ school: adminId });

        const inUseClassroomIds = await Course.find({
            school: adminId,
            day: standardizedDay,
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        }).distinct('classroomId').exec();

        const inUseClassroomIdsString = inUseClassroomIds.map(id => id.toString());

        const emptyClassrooms = classroomsOwnedByAdmin.filter(classroom =>
            !inUseClassroomIdsString.includes(classroom._id.toString())
        );
        res.status(200).json({ emptyClassrooms });
    } catch (error) {
        console.error("Error listing empty classrooms:", error);
        res.status(500).json({ message: "Error listing empty classrooms!" });
    }
};
