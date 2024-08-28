const mongoose = require("mongoose");
const { isEmail } = require("validator");

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Le nom est obligatoire"],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, "L'email est obligatoire"],
        validate: [isEmail, "Veuillez entrer un email valide"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est obligatoire"],
        minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"]
    },
    role: {
        type: String,
        default: "Teacher"
    },
    teachSubject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, "La matière est obligatoire"]
    },
    sex: {
        type: String,
        enum: ['Male', 'Female'],
        required: [true, "Le sexe est obligatoire"]
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    isActive: { type: Boolean, default: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
