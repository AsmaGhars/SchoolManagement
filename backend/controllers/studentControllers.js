const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");
const Student = require('../models/Student');
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

const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const validateSignUpData = async (req, res) => {
    const { name, birthDate, address, phone, email, password, sex } = req.body;

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

    if (!sex || !['Male', 'Female'].includes(sex)) {
      return res.status(400).json({ msg: "Sex is required and must be one of 'Male' or 'Female'" });
  }

    if (!birthDate || isNaN(Date.parse(parseDate(birthDate)))) {
        return res.status(400).json({ msg: "Valid birth date is required" });
    }

    if (!address.trim()) {
        return res.status(400).json({ msg: "Address is required" });
    }

    if (!/^\d{8}$/.test(phone)) {
        return res.status(400).json({ msg: "Valid phone number is required (8 digits)" });
    }

    const existingStudent = await Student.findOne({ email: email }).exec();
    if (existingStudent) {
        return res.status(400).json({ message: "Email Already Registered" });
    }

    return true;
};

exports.addStudent = async (req, res) => {
  const { name, birthDate, address, phone, email, password, sex } = req.body;
  const adminId = req.user._id;

  const existingStudent = await Student.findOne({ email: req.body.email });
  if (existingStudent) {
    return res.status(400).json({ message: 'Student with this email already exists' });
  }
  const isValid = await validateSignUpData(req, res);
  if (isValid) {
      try {
          const formattedName = capitalizeName(name);
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          const student = await Student.create({ name: formattedName, birthDate, address, phone, email, password: hashedPassword, sex, school: adminId });

          return res.status(201).json({
              message: "Account Created Successfully",
              student: {
                  _id: student._id,
                  name: student.name,
                  birthDate: student.birthDate,
                  address: student.address,
                  phone: student.phone,
                  email: student.email,
                  sex: student.sex
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
        const dbStudent = await Student.findOne({ email }).exec();
        if (!dbStudent) {
            return res.status(400).json({ message: "Email or Password incorrect" });
        }

        const match = await bcrypt.compare(password, dbStudent.password);
        if (match) {
            const token = jwt.sign(
                { _id: dbStudent._id, name: dbStudent.name, email, role: dbStudent.role },
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

exports.getStudents = async (req, res) => {
    try {
      const adminId = req.user._id; 
      const students = await Student.find({ school: adminId }).populate('examResult.subName attendance.subject');        
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Error finding Students" });
    }
};

exports.studentDetails = async (req, res) => {
  try {
      const studentId = req.params.id;
      const userId = req.user._id;
      let user = await Student.findById(userId).exec();
    if (!user) {
      user = await Admin.findById(userId).exec();
    }

      const student = await Student.findOne({
          _id: studentId,
          $or: [
              { school: userId },
              { _id: userId }     
          ]
      }).populate('examResult.subName attendance.subject');

      if (!student) {
          return res.status(404).json({ message: "No Student Found or Unauthorized Access" });
      }

      if (user.role == "Student") {
        if (student.isActive == false) {
          return res.status(403).json({ message: "Student account is not active" });
        }
      }
      res.json(student);
  } catch (error) {
      console.error("Error finding Student details:", error);
      res.status(500).json({ message: "Error finding Student details" });
  }
};


exports.updateStudent = async (req, res) => {
  const { studentId } = req.params;
  const { name, birthDate, address, phone, email, sex } = req.body;

  if (req.user.id !== studentId) {
    return res.status(403).json({ message: "You are not authorized to update this student's information" });
  }

  if (name && !name.trim()) {
    return res.status(400).json({ msg: "Name is required" });
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ msg: "Invalid email" });
  }

  if (phone && !/^\d{8}$/.test(phone)) {
    return res.status(400).json({ msg: "Valid phone number is required (8 digits)" });
  }

  if (address && !address.trim()) {
    return res.status(400).json({ msg: "Address is required" });
  }

  try {
    if (email) {
      const existingStudent = await Student.findOne({ email }).exec();
      if (existingStudent && existingStudent._id.toString() !== studentId) {
        return res.status(400).json({ message: "Email already registered with another account" });
      }
    }

    const formattedName = name ? capitalizeName(name) : undefined;
    const formattedBirthDate = birthDate ? parseDate(birthDate) : undefined;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    if (!student.isActive){
      return res.status(400).json({ message: "Student is inactive" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        name: formattedName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        birthDate: formattedBirthDate || undefined,
        sex: sex || undefined
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Student updated successfully", student: updatedStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating student" });
  }
};


exports.deleteStudent = async (req, res) => {
  const { studentId } = req.params;

  try {
      const student = await Student.findById(studentId).populate('school');

      const adminId = student.school._id.toString(); 

      if (req.user._id.toString() !== adminId) {
          return res.status(403).json({ message: "You are not authorized to delete this student's account" });
      }

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
    }

      await Student.findByIdAndDelete(studentId);

      res.json({ message: "Student deleted successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting student" });
  }
};


exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const studentId = req.user._id;
  
    if (!oldPassword || !newPassword) {
      console.log("Missing old or new password in request body");
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required" });
    }
  
    try {
      const student = await Student.findById(studentId).exec();
  
      if (!student) {
        console.log("Student not found");
        return res.status(404).json({ message: "Student not found" });
      }

      if(!student.isActive){
        return res.status(400).json({ message: "Student account is inactive" });
      }
  
      if (!student.password) {
        console.log("Student password not found");
        return res
          .status(500)
          .json({ message: "No password found for this student" });
      }
  
      const match = await bcrypt.compare(oldPassword, student.password);
  
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
  
      student.password = await bcrypt.hash(newPassword, saltRounds);
      await student.save();
  
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
      const student = await Student.findOne({ email }).exec();
  
      if (!student) {
        return res.status(404).json({ message: "Student Not Found" });
      }
  
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  
      student.resetPasswordToken = resetTokenHash;
      student.resetPasswordExpires = Date.now() + 3600000;
  
      await student.save();
  
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/students/reset-password/${resetToken}`;
  
      await sendEmail(
        student.email,
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
      const student = await Student.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now()},
      }).exec();
  
      if (!student) {
        console.log("No matching student found or token expired");
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      student.password = await bcrypt.hash(newPassword, saltRounds);
      student.resetPasswordToken = undefined;
      student.resetPasswordExpires = undefined;
  
      await student.save();
  
      res.json({ message: "Password has been reset" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Error resetting password" });
    }
};

