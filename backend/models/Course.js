const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: [true, "Class is required"]
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, "Subject is required"]
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, "Teacher is required"]
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: [true, "Classroom is required"]
    },
    day: {
        type: String,
        required: [true, "Day is required"],
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    startTime: {
        type: String,
        required: [true, "Start hour is required"],
        validate: {
            validator: function(v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: "Start hour must be in HH:MM format"
        }
    },
    endTime: {
        type: String,
        required: [true, "End hour is required"],
        validate: {
            validator: function(v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: "End hour must be in HH:MM format"
        }
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
      }
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
