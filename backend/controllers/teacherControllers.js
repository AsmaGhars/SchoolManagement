const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");
const Teacher = require('../models/Teacher');
const crypto = require("crypto");
const sendEmail = require("../mailer");
require("dotenv").config();

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

const capitalizeName = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
};

const validateSignUpData = async (req, res) => {
    const { name, email, password, teachSubject, sex } = req.body;

    if (!name.trim()) {
        return res.status(400).json({ msg: "Name is required" });
    }

    if (!isEmail(email)) {
        return res.status(400).json({ msg: "Invalid email" });
    }

    if (!password.trim()) {
        return res.status(400).json({ msg: "Password is required" });
    } else if (password.trim().length < 8) {
        return res.status(400).json({ msg: "Password must be at least 8 characters long" });
    }

    if (!teachSubject.trim()) {
        return res.status(400).json({ msg: "Taught Subject is Required" });
    }

    if (!sex || !['Male', 'Female'].includes(sex)) {
        return res.status(400).json({ msg: "Sex must be Male or Female" });
    }

    const existingTeacher = await Teacher.findOne({ email: email }).exec();
    if (existingTeacher) {
        return res.status(400).json({ message: "Email Already Registered" });
    }

    return true;
};


exports.addTeacher = async (req, res) => {
    const { name, email, password, teachSubject, sex } = req.body;
    const adminId = req.user._id;

    const existingTeacher = await Teacher.findOne({ email: req.body.email });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher with this email already exists' });
    }
    const isValid = await validateSignUpData(req, res);
    if (isValid) {
        try {
            const formattedName = capitalizeName(name);
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const teacher = await Teacher.create({
                name: formattedName,
                email,
                password: hashedPassword,
                teachSubject,
                sex,
                school: adminId
            });

            return res.status(201).json({
                message: "Account Created Successfully",
                teacher: {
                    _id: teacher._id,
                    name: teacher.name,
                    email: teacher.email,
                    teachSubject: teacher.teachSubject,
                    sex: teacher.sex
                },
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({ message: "Internal server error" });
        }
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const dbTeacher = await Teacher.findOne({ email }).exec();
        if (!dbTeacher) {
            return res.status(400).json({ message: "Email or Password incorrect" });
        }

        const match = await bcrypt.compare(password, dbTeacher.password);
        if (match) {
            const token = jwt.sign(
                { _id: dbTeacher._id, name: dbTeacher.name, email, role: dbTeacher.role },
                process.env.JWT_LOGIN_TOKEN,
                { expiresIn: "1d" }
            );

            return res.json({
                message: "Login Successful",
                token,
            });
        } else {
            return res.status(400).json({ message: "Email or Password incorrect" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.logout = async (req, res) => {
    res.status(200).json({
      success: true,
      message: "Logged out",
    });
};

exports.getTeachers = async (req, res) => {
    try {
        const adminId = req.user._id;
        const teachers = await Teacher.find({ school: adminId }).exec();
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: "Error finding teachers" });
    }
};

exports.teacherDetails = async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params; 

    try {
        const teacher = await Teacher.findById(id).exec();

        if (!teacher) {
            return res.status(404).json({ message: "No Teacher Found" });
        }

        if (teacher.school.toString() === userId.toString() || userId.toString() === teacher._id.toString()) {
            return res.json(teacher);
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error finding teacher details" });
    }
};


exports.updateTeacher = async (req, res) => {
    const { teacherId } = req.params;
    const { name, email, teachSubject, sex } = req.body;

    if (req.user._id.toString() !== teacherId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    if (name && !name.trim()) {
        return res.status(400).json({ msg: "Name is required" });
    }

    if (email && !isEmail(email)) {
        return res.status(400).json({ msg: "Invalid email" });
    }

    try {
        if (email) {
            const existingTeacher = await Teacher.findOne({ email }).exec();
            if (existingTeacher && existingTeacher._id.toString() !== teacherId) {
                return res.status(400).json({ message: "Email already registered with another account" });
            }
        }

        const formattedName = name ? capitalizeName(name) : undefined;

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            teacherId,
            {
                name: formattedName || undefined,
                email: email || undefined,
                teachSubject: teachSubject || undefined,
                sex: sex || undefined
            },
            { new: true, runValidators: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.json({ message: "Teacher updated successfully", teacher: updatedTeacher });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating teacher" });
    }
};

exports.deleteTeacher = async (req, res) => {
    const { teacherId } = req.params;

    try {
        const teacher = await Teacher.findById(teacherId).exec();
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const adminId = teacher.school.toString(); 

        if (req.user._id.toString() === adminId) {
            await Teacher.findByIdAndDelete(teacherId);
            return res.json({ message: "Teacher deleted successfully" });
        } else {
            return res.status(403).json({ message: "Forbidden" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting teacher" });
    }
};


exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const teacherId = req.user._id;
  
    if (!oldPassword || !newPassword) {
      console.log("Missing old or new password in request body");
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required" });
    }
  
    try {
      const teacher = await Teacher.findById(teacherId).exec();
  
      if (!teacher) {
        console.log("Teacher not found");
        return res.status(404).json({ message: "Teacher not found" });
      }
  
      if (!teacher.password) {
        console.log("Teacher password not found");
        return res
          .status(500)
          .json({ message: "No password found for this teacher" });
      }
  
      const match = await bcrypt.compare(oldPassword, teacher.password);
  
      if (!match) {
        console.log("Old password is incorrect");
        return res.status(400).json({ message: "Old password is incorrect" });
      }
  
      if (newPassword.trim().length <= 7) {
        console.log("New password is too short");
        return res
          .status(400)
          .json({ message: "New password must be at least 8 characters long" });
      }
  
      teacher.password = await bcrypt.hash(newPassword, saltRounds);
      await teacher.save();
  
      console.log("Password changed successfully");
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Error changing password" });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const teacher = await Teacher.findOne({ email }).exec();
  
      if (!teacher) {
        return res.status(404).json({ message: "Teacher Not Found" });
      }
  
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  
      teacher.resetPasswordToken = resetTokenHash;
      teacher.resetPasswordExpires = Date.now() + 3600000;
  
      await teacher.save();
  
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/teachers/reset-password/${resetToken}`;
  
      await sendEmail(
        teacher.email,
        "Password Reset Request",
        `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          ${resetUrl}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      );
  
      res.json({ message: "Password reset token sent to email" });
    } catch (error) {
      console.error("Error sending password reset email:", error);
      res.status(500).json({ message: "Error sending password reset email" });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
  
    try {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      const teacher = await Teacher.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now()},
      }).exec();
  
      if (!teacher) {
        console.log("No matching teacher found or token expired");
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      teacher.password = await bcrypt.hash(newPassword, saltRounds);
      teacher.resetPasswordToken = undefined;
      teacher.resetPasswordExpires = undefined;
  
      await teacher.save();
  
      res.json({ message: "Password has been reset" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Error resetting password" });
    }
};

exports.getTeachersBySubject = async (req, res) => {
    const { subject } = req.query;
    if (!subject) {
        return res.status(400).json({ message: "Subject is required" });
    }

    try {
        const adminId = req.user._id;
        const teachers = await Teacher.find({ teachSubject: subject, school: adminId }).exec();

        if (teachers.length === 0) {
            return res.status(404).json({ message: "No teachers found for this subject" });
        }

        res.json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving teachers by subject" });
    }
};