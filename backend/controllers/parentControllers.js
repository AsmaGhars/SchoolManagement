const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");
const Parent = require("../models/Parent");
const Student = require("../models/Student");
const crypto = require("crypto");
const sendEmail = require("../mailer");
require("dotenv").config();
const mongoose = require("mongoose");

const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;

const capitalizeName = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const validateSignUpData = async (req, res) => {
  const { name, email, password, phone, address, relationship, sex } = req.body;

  if (!name.trim()) {
    return res.status(400).json({ msg: "Name is required" });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ msg: "Invalid email" });
  }

  if (!password.trim()) {
    return res.status(400).json({ msg: "Password is required" });
  } else if (password.trim().length < 8) {
    return res
      .status(400)
      .json({ msg: "Password must be at least 8 characters long" });
  }

  if (!phone) {
    return res.status(400).json({ msg: "Phone number is required" });
  }

  if (!address.trim()) {
    return res.status(400).json({ msg: "Address is required" });
  }

  const validRelationships = ["Father", "Mother", "Guardian"];
  if (!validRelationships.includes(relationship)) {
    return res.status(400).json({
      msg: "Invalid relationship type. Must be 'Father', 'Mother', or 'Guardian'",
    });
  }

  const validSex = ["Male", "Female"];
  if (!validSex.includes(sex)) {
    return res.status(400).json({
      msg: "Invalid sex type. Must be 'Male' or 'Female'",
    });
  }

  const existingParent = await Parent.findOne({ email: email }).exec();
  if (existingParent) {
    return res.status(400).json({ message: "Email Already Registered" });
  }

  return true;
};

exports.addParent = async (req, res) => {
  const { name, email, password, phone, address, relationship, sex } = req.body;

  const adminId = req.user._id;
  const existingParent = await Parent.findOne({ email: req.body.email });
  if (existingParent) {
    return res
      .status(400)
      .json({ message: "Parent with this email already exists" });
  }
  const isValid = await validateSignUpData(req, res);
  if (isValid) {
    try {
      const formattedName = capitalizeName(name);

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const parent = await Parent.create({
        name: formattedName,
        email,
        password: hashedPassword,
        phone,
        address,
        relationship,
        sex,
        school: adminId,
      });

      return res.status(201).json({
        message: "Account Created Successfully",
        parent: {
          _id: parent._id,
          name: parent.name,
          email: parent.email,
          phone: parent.phone,
          address: parent.address,
          relationship: parent.relationship,
          sex: parent.sex,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Internal server error" });
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const dbParent = await Parent.findOne({ email }).exec();
    if (!dbParent) {
      return res.status(400).json({ message: "Email or Password incorrect" });
    }

    const match = await bcrypt.compare(password, dbParent.password);
    if (match) {
      const token = jwt.sign(
        { _id: dbParent._id, name: dbParent.name, email, role: dbParent.role },
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

exports.getParents = async (req, res) => {
  try {
    const adminId = req.user._id;
    const parents = await Parent.find({ school: adminId })
      .select("-password")
      .exec();
    res.json(parents);
  } catch (error) {
    res.status(500).json({ message: "Error finding Parents" });
  }
};

exports.parentDetails = async (req, res) => {
  try {
    const parentId = req.params.id;
    const userId = req.user._id;
    let user = await Parent.findById(userId).exec();
    if (!user) {
      user = await Admin.findById(userId).exec();
    }

    let parent = await Parent.findOne({
      _id: parentId,
      $or: [{ school: userId }, { _id: userId }],
    })
      .select("-password")
      .exec();

    if (parent) {
      if (user.role == "Parent") {
        if (parent.isActive == false) {
          return res.status(403).json({ message: "Parent is not active" });
        }
      }
      res.send(parent);
    } else {
      res.send({ message: "No Parent Found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error finding Parent details" });
  }
};

exports.updateParent = async (req, res) => {
  const { parentId } = req.params;
  const { name, email, phone, address, relationship, sex } = req.body;

  if (req.user.id !== parentId) {
    return res.status(403).json({
      message: "You are not authorized to update this parent's information",
    });
  }

  if (name && !name.trim()) {
    return res.status(400).json({ msg: "Name is required" });
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ msg: "Invalid email" });
  }

  if (address && !address.trim()) {
    return res.status(400).json({ msg: "Address is required" });
  }

  const validRelationships = ["Father", "Mother", "Guardian"];
  if (relationship && !validRelationships.includes(relationship)) {
    return res.status(400).json({
      msg: "Invalid relationship type. Must be 'Father', 'Mother', or 'Guardian'",
    });
  }

  const validSex = ["Male", "Female"];
  if (sex && !validSex.includes(sex)) {
    return res.status(400).json({
      msg: "Invalid sex type. Must be 'Male' or 'Female'",
    });
  }

  try {
    if (email) {
      const existingParent = await Parent.findOne({ email }).exec();
      if (existingParent && existingParent._id.toString() !== parentId) {
        return res
          .status(400)
          .json({ message: "Email already registered with another account" });
      }
    }

    const formattedName = name ? capitalizeName(name) : undefined;

    const updatedParent = await Parent.findById(parentId);

    if (!updatedParent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    if (!updatedParent.isActive){
      return res.status(400).json({ message: "Parent is inactive" });
    }

    const newParent = await Parent.findByIdAndUpdate(
      parentId,
      {
        name: formattedName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        relationship: relationship || undefined,
        sex: sex || undefined,
      },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ message: "Parent updated successfully", parent: newParent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating Parent" });
  }
};

exports.deleteParent = async (req, res) => {
  const { parentId } = req.params;
  try {
    const deletedParent = await Parent.findById(parentId).populate("school");

    if (!deletedParent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const adminId = deletedParent.school._id.toString();
    if (req.user._id.toString() !== adminId) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to delete this Parent's account",
        });
    }

    await Parent.findByIdAndDelete(parentId);

    res.json({ message: "Parent deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting Parent" });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const parentId = req.user._id;

  if (!oldPassword || !newPassword) {
    console.log("Missing old or new password in request body");
    return res
      .status(400)
      .json({ message: "Both old and new passwords are required" });
  }

  try {
    const parent = await Parent.findById(parentId).exec();

    if (!parent) {
      console.log("Parent not found");
      return res.status(404).json({ message: "Parent not found" });
    }

    if(!parent.isActive){
      return res.status(400).json({ message: "Parent account is inactive" });
    }

    if (!parent.password) {
      console.log("Parent password not found");
      return res
        .status(500)
        .json({ message: "No password found for this parent" });
    }

    const match = await bcrypt.compare(oldPassword, parent.password);

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

    parent.password = await bcrypt.hash(newPassword, saltRounds);
    await parent.save();

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
    const parent = await Parent.findOne({ email }).exec();

    if (!parent) {
      return res.status(404).json({ message: "Parent Not Found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    parent.resetPasswordToken = resetTokenHash;
    parent.resetPasswordExpires = Date.now() + 3600000;

    await parent.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/parents/reset-password/${resetToken}`;

    await sendEmail(
      parent.email,
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
    const parent = await Parent.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).exec();

    if (!parent) {
      console.log("No matching parent found or token expired");
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    parent.password = await bcrypt.hash(newPassword, saltRounds);
    parent.resetPasswordToken = undefined;
    parent.resetPasswordExpires = undefined;

    await parent.save();

    res.json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

exports.addChild = async (req, res) => {
  const { parentId } = req.params;
  const { studentIds } = req.body;

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res
      .status(400)
      .json({ message: "Student IDs must be provided as an array" });
  }

  try {
    const isValidObjectId = mongoose.Types.ObjectId.isValid;
    const invalidIds = studentIds.filter((id) => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res
        .status(400)
        .json({ message: "Invalid student IDs", invalidIds });
    }

    const parent = await Parent.findById(parentId).exec();
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const adminId = req.user._id;
    if (parent.school.toString() !== adminId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to modify this parent" });
    }

    const students = await Student.find({
      _id: { $in: studentIds },
      school: adminId,
    }).exec();
    if (students.length !== studentIds.length) {
      return res
        .status(400)
        .json({
          message: "Some student IDs are invalid or not owned by this admin",
        });
    }

    const updatedParent = await Parent.findByIdAndUpdate(
      parentId,
      { $addToSet: { children: { $each: studentIds } } },
      { new: true, runValidators: true }
    ).exec();

    res.json({
      message: "Students added successfully",
      parent: updatedParent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding students to parent" });
  }
};
