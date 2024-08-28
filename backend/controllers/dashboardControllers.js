const Student = require('../models/Student');
const Bulletin = require('../models/Bulletin');
const AttendanceReport = require('../models/AttendanceReport');
const Absence = require('../models/Absence'); 

const getEnrollmentCount = async (adminId) => {
    try {
        return await Student.countDocuments({ school: adminId, isActive: true });
    } catch (error) {
        throw new Error('Error fetching enrollment count: ' + error.message);
    }
};

const getSuccessfulStudentsCount = async (adminId) => {
    try {
        const successfulStudents = await Bulletin.aggregate([
            { $match: { school: adminId } },
            { 
                $group: {
                    _id: "$studentId",
                    average: { $avg: "$average" }
                }
            },
            { $match: { average: { $gte: 10 } } },
            { 
                $count: "totalSuccessfulStudents" 
            }
        ]);

        return successfulStudents.length > 0 ? successfulStudents[0].totalSuccessfulStudents : 0;
    } catch (error) {
        throw new Error('Error fetching successful students count: ' + error.message);
    }
};

const getPresenceAndAbsenceStats = async (adminId) => {
    try {
        const totalPresences = await AttendanceReport.aggregate([
            { $match: { adminId: adminId } },
            { 
                $group: {
                    _id: null,
                    totalPresences: { $sum: "$totalPresences" }
                }
            }
        ]);
        const totalPresencesCount = totalPresences.length > 0 ? totalPresences[0].totalPresences : 0;

        const totalAbsencesAndTardies = await Absence.aggregate([
            { $group: {
                _id: null,
                totalAbsences: { $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] } },
                totalTardies: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } }
            }}
        ]);
        const totalAbsences = totalAbsencesAndTardies.length > 0 ? totalAbsencesAndTardies[0].totalAbsences : 0;
        const totalTardies = totalAbsencesAndTardies.length > 0 ? totalAbsencesAndTardies[0].totalTardies : 0;

        const totalStudents = await getEnrollmentCount(adminId);

        const averagePresenceRate = totalPresencesCount > 0 ? (totalPresencesCount / (totalPresencesCount + totalAbsences + totalTardies)) * 100 : 0;
        const averageAbsencesPerStudent = totalStudents > 0 ? (totalAbsences /(totalPresencesCount + totalAbsences + totalTardies)) * 100 : 0;
        const averageTardiesPerStudent = totalStudents > 0 ? (totalTardies / (totalPresencesCount + totalAbsences + totalTardies)) * 100 : 0;

        return {
            totalPresencesCount,
            totalAbsences,
            totalTardies,
            averagePresenceRate,
            averageAbsencesPerStudent,
            averageTardiesPerStudent
        };
    } catch (error) {
        throw new Error('Error fetching presence and absence statistics: ' + error.message);
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const adminId = req.user._id;
        if (!adminId) {
            return res.status(400).json({ message: 'adminId is required' });
        }

        const enrollments = await getEnrollmentCount(adminId);
        const successfulStudents = await getSuccessfulStudentsCount(adminId);
        const {
            totalPresencesCount,
            totalAbsences,
            totalTardies,
            averagePresenceRate,
            averageAbsencesPerStudent,
            averageTardiesPerStudent
        } = await getPresenceAndAbsenceStats(adminId);

        const successRate = enrollments > 0 ? (successfulStudents / enrollments) * 100 : 0;

        res.json({
            enrollments,
            successRate: successRate.toFixed(2),
            averagePresenceRate: averagePresenceRate.toFixed(2),
            averageAbsencesPerStudent: averageAbsencesPerStudent.toFixed(2),
            averageTardiesPerStudent: averageTardiesPerStudent.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
