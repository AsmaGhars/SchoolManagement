const mongoose = require("mongoose");
const {isEmail} = require("validator");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
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
    role: {
        type: String,
        enum: ["Admin"],
        default: "Admin",
        immutable: true
    },
    schoolName: {
        type: String,
        unique: true,
        required: true
    },
    fees: {
        type: Number,
        required: true
    },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;