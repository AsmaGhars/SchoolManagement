const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');

const parentSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (v) => validator.isEmail(v),
            message: props => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [8, "Password must be at least 8 characters"]
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
        validate: {
          validator: function(v) {
            return /^\+?[1-9]\d{1,14}$/.test(v); 
          },
          message: props => `${props.value} is not a valid phone number!`
        }
    },
    address: {
        type: String,
        trim: true,
        required: false
    },
    relationship: {
        type: String,
        required: true,
        enum: ['Father', 'Mother', 'Guardian'],
        default: 'Guardian'
    },
    sex: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    children: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }],
    role: {
        type: String,
        enum: ["Parent"],
        default: "Parent",
        immutable: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const Parent = mongoose.model('Parent', parentSchema);

module.exports = Parent;
