const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: [true, "Le nom de la classe est obligatoire"],
        trim: true,
        unique: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    nbrStudents: {
        type: Number,
        default: 0,
        max: [40, "La classe ne peut pas avoir plus de 40 étudiants"]
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student' 
    }],
    subjects: [{
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' } 
    }]
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
