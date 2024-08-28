const mongoose = require("mongoose");
const { isEmail } = require("validator");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    birthDate: {
        type: Date,
        required: [true, "Please enter your birth date"]
    },
    address: {
        type: String,
        required: [true, "Please enter your address"]
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
        validate: {
            validator: function(v) {
                return /\d{8}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        },
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [8, "Password must be at least 8 characters"]
    },
    sex: {
        type: String,
        enum: ['Male', 'Female'],
        required: [true, "Please specify your sex"]
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: "Student"
    },
    examResult: [
        {
            subName: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
                required: [true, "Subject reference is required"]
            },
            marksObtained: {
                type: Number,
                min: [0, "Marks cannot be negative"],
                default: 0
            }
        }
    ],
    attendance: [
        {
            date: {
                type: Date,
                required: [true, "Date is required"]
            },
            status: {
                type: String,
                enum: ['Present', 'Absent', 'Late'],
                required: [true, "Attendance status is required"]
            },
            subject: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Subject',
                required: [true, "Subject reference is required"]
            }
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
