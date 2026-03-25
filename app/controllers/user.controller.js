const db = require("../models");
const User = db.user;

const sanitizeUser = (userDoc) => ({
  id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  dob: userDoc.dob,
  profilePic: userDoc.profilePic,
  salary: userDoc.salary,
  monthlySalary: userDoc.monthlySalary, // backward compatibility
  role: userDoc.role,
  isLoggedIn: userDoc.isLoggedIn,
  lastLoginAt: userDoc.lastLoginAt,
  createdAt: userDoc.createdAt,
  updatedAt: userDoc.updatedAt,
});

const parseDob = (value) => {
  if (value === null || value === undefined) return undefined;
  if (value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
};

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("Employee/Authenticated Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.managerBoard = (req, res) => {
  res.status(200).send("Manager Content.");
};

exports.updateMe = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).send({ message: "User not found." });

    // Never allow email/password updates from profile edit.
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "email")) {
      return res.status(400).send({ message: "Email cannot be changed." });
    }
    if (Object.prototype.hasOwnProperty.call(req.body || {}, "password")) {
      return res.status(400).send({ message: "Password cannot be changed here." });
    }

    const { name, dob, salary, monthlySalary, role } = req.body || {};

    if (name !== undefined) user.name = String(name).trim();

    if (dob !== undefined) {
      const parsed = parseDob(dob);
      if (parsed === undefined) return res.status(400).send({ message: "Invalid DOB format." });
      user.dob = parsed;
    }

    if (req.file) {
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    // `role` and `salary` can only be changed by admin (enforced by middleware).
    const salaryInput = salary === undefined ? monthlySalary : salary;
    if (salaryInput !== undefined) {
      if (salaryInput === "" || salaryInput === null) user.salary = 0;
      else {
        const s = Number(salaryInput);
        if (Number.isNaN(s) || s < 0) return res.status(400).send({ message: "salary must be non-negative." });
        user.salary = s;
      }
    }

    if (role !== undefined) {
      const normalizedRole = String(role).trim().toLowerCase();
      user.role = normalizedRole;
    }

    await user.save();
    return res.status(200).send({ user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).send({ message: err.message || "Profile update failed." });
  }
};
