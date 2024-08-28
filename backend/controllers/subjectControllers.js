const Subject = require('../models/Subject');
const Course = require('../models/Course');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

exports.createSubject = async (req, res) => {
    try {
        const { subName, coefficient } = req.body;
        const adminId = req.user._id;

        if (!subName || !subName.trim() || !coefficient) {
            return res.status(400).json({ msg: "Subject name and coefficient are required" });
        }

        const normalizedSubName = capitalizeFirstLetter(subName.trim());

        const existingSubject = await Subject.findOne({ subName: normalizedSubName });

        if (existingSubject) {
            return res.status(409).json({ message: 'Subject name already exists. It must be unique.' });
        }

        const subject = new Subject({
            subName: normalizedSubName,
            coefficient,
            school: adminId
        });

        await subject.save();

        return res.status(201).json({
            message: "Subject created successfully",
            subject,
        });

    } catch (err) {
        console.error('Error creating subject:', err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ school: req.user._id }).exec();
        if (subjects.length > 0) {
            res.send(subjects)
        } else {
            res.send({ message: "No subjects found" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getSubjectById = async (req, res) => {
    const { id } = req.params;

    try {
        const subject = await Subject.findById(id).exec();

        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        if (subject.school.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to view this subject" });
          }

        return res.json(subject);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { subName, coefficient } = req.body;
        const adminId = req.user._id;

        const subject = await Subject.findById(id).exec();

        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }        
        if (subject.school.toString() !== adminId.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this subject" });
        }

        const normalizedSubName = capitalizeFirstLetter(subName.trim());

        const existingSubject = await Subject.findOne({ 
            subName: normalizedSubName, 
            _id: { $ne: id },
            school: adminId 
        });

        if (existingSubject) {
            return res.status(409).json({ message: 'Subject name already exists. It must be unique.' });
        }

        // Update the subject
        const updatedSubject = await Subject.findByIdAndUpdate(
            id,
            { subName: normalizedSubName, coefficient },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Subject updated successfully",
            subject: updatedSubject,
        });

    } catch (err) {
        console.error('Error updating subject:', err);

        if (err.code === 11000) {
            return res.status(409).json({ message: 'Duplicate key error: The subject name already exists.' });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    const adminId = req.user._id;

    try {
        const subject = await Subject.findById(id).exec();

        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        if (subject.school.toString() !== adminId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this subject" });
        }

        await Course.deleteMany({ subjectId: id }).exec();
        await Class.updateMany(
            { 'subjects.subjectId': id },
            { $pull: { subjects: { subjectId: id } } }
        ).exec();
        await Teacher.deleteMany({ teachSubject: id }).exec();

        await Subject.findByIdAndDelete(id).exec();

        return res.json({
            message: "Subject and related courses, class references, and teacher assignments deleted successfully",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.freeSubjectList = async (req, res) => {
    try {
        const subjects = await Subject.find({ school: req.user._id }).exec();

        const freeSubjects = await Promise.all(subjects.map(async (subject) => {
            const isAssigned = await Teacher.findOne({ teachSubject: subject._id }).exec();
            return isAssigned ? null : subject;
        }));

        const availableSubjects = freeSubjects.filter(subject => subject !== null);

        if (availableSubjects.length > 0) {
            res.status(200).send(availableSubjects);
        } else {
            res.status(404).send({ message: "No subjects found without a teacher" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};