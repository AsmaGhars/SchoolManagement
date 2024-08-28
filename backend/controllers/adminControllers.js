const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");
const Admin = require("../models/Admin");
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
  const { name, email, password, schoolName } = req.body;

  if (name.trim().length === 0) {
    res.status(400).json({ msg: "Name is required" });
    return false;
  }

  if (!isEmail(email)) {
    res.status(400).json({ msg: "Invalid email" });
    return false;
  }

  if (password.trim().length === 0) {
    res.status(400).json({ msg: "Password is required" });
    return false;
  } else if (password.trim().length <= 7) {
    res
      .status(400)
      .json({ msg: "Password must be at least 8 characters long" });
    return false;
  }

  if (schoolName.trim().length === 0) {
    res.status(400).json({ msg: "School Name is required" });
    return false;
  }

  const existingAdmin = await Admin.findOne({ email: email }).exec();
  if (existingAdmin) {
    console.log("Email Already Registered");
    res.status(400).json({ message: "Email Already Registered" });
    return false;
  }

  return true;
};

exports.signup = async (req, res) => {
  const { name, email, password, schoolName, fees } = req.body;

  const isValid = await validateSignUpData(req, res);
  if (isValid) {
    try {
      const formattedName = capitalizeName(name);
      const formattedSchoolName = capitalizeName(schoolName);

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const admin = await Admin.create({
        name: formattedName,
        email,
        password: hashedPassword,
        schoolName: formattedSchoolName,
        fees,
      });

      return res.json({
        message: "Account Created Successfully",
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          schoolName: admin.schoolName,
          fees: admin.fees,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: err });
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const dbAdmin = await Admin.findOne({ email }).exec();
  if (dbAdmin) {
    const match = await bcrypt.compare(password, dbAdmin.password);

    if (match) {
      const token = jwt.sign(
        { _id: dbAdmin._id, name: dbAdmin.name, email, role: dbAdmin.role },
        process.env.JWT_LOGIN_TOKEN,
        {
          expiresIn: "1d",
        }
      );

      res.json({
        message: "Login Successful",
        token,
      });
    } else {
      res.status(400).json({ message: "Username or Password incorrect" });
    }
  } else {
    res.status(400).json({ message: "Username or Password incorrect" });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).select("-password").exec();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error finding Admins" });
  }
};

exports.adminDetails = async (req, res) => {
  try {
    const adminId = req.user._id;

    let admin = await Admin.findById(adminId).select("-password").exec();
    if (admin) {
      res.send(admin);
    } else {
      res.send({ message: "No Admin Found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error finding admin details" });
  }
};

exports.updateAdmin = async (req, res) => {
  const adminId = req.user._id;
  const { name, email, schoolName, fees } = req.body;

  if ((name && !name.trim()) || (schoolName && !schoolName.trim())) {
    return res.status(400).json({ msg: "Name and School Name are required" });
  }

  try {
    if (email) {
      const existingAdmin = await Admin.findOne({ email }).exec();
      if (existingAdmin && existingAdmin._id.toString() !== adminId) {
        return res.status(400).json({ msg: "Email already exists" });
      }
    }

    const formattedName = name ? capitalizeName(name) : undefined;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      {
        name: formattedName || undefined,
        email: email || undefined,
        schoolName: schoolName || undefined,
        fees: fees || undefined,
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating Admin" });
  }
};

exports.deleteAdmin = async (req, res) => {
  const adminId = req.user._id;

  try {
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting Admin" });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const adminId = req.user._id;

  if (!oldPassword || !newPassword) {
    console.log("Missing old or new password in request body");
    return res
      .status(400)
      .json({ message: "Both old and new passwords are required" });
  }

  try {
    const admin = await Admin.findById(adminId).exec();

    if (!admin) {
      console.log("Admin not found");
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.password) {
      console.log("Admin password not found");
      return res
        .status(500)
        .json({ message: "No password found for this admin" });
    }

    const match = await bcrypt.compare(oldPassword, admin.password);

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

    admin.password = await bcrypt.hash(newPassword, saltRounds);
    await admin.save();

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
    const admin = await Admin.findOne({ email }).exec();

    if (!admin) {
      return res.status(404).json({ message: "Admin Not Found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    admin.resetPasswordToken = resetTokenHash;
    admin.resetPasswordExpires = Date.now() + 3600000;

    await admin.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/admins/reset-password/${resetToken}`;
    console.log(resetUrl);

    await sendEmail(
      admin.email,
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
  console.log('Received request for reset password with token:', token)

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).exec();

    if (!admin) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    admin.password = await bcrypt.hash(newPassword, saltRounds);
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    res.json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

exports.logout = async (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out." });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    res.status(400).json({ message: "No session found." });
  }
};
