const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const sanitizeUser = (userDoc) => ({
  id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  profilePic: userDoc.profilePic,
  dob: userDoc.dob,
  salary: userDoc.salary,
  monthlySalary: userDoc.monthlySalary, // backward compatibility
  role: userDoc.role,
});

const parseOptionalDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const getUserIdFromSessionToken = (req) => {
  try {
    const token = req.session?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, config.secret);
    return decoded?.id || null;
  } catch {
    return null;
  }
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, dob, salary, monthlySalary, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send({ message: "name, email and password are required." });
    }

    if (String(password).length < 6) {
      return res.status(400).send({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const wantedRole = (role || "employee").toString().trim().toLowerCase();
    const allowedSelfSignupRoles = ["employee", "manager"];
    if (!allowedSelfSignupRoles.includes(wantedRole)) {
      return res.status(400).send({
        message: `Role ${wantedRole} is not allowed for public signup.`,
      });
    }

    const parsedDob = parseOptionalDate(dob);
    if (parsedDob === undefined) {
      return res.status(400).send({ message: "Invalid DOB format." });
    }

    const salaryInput = salary === undefined ? monthlySalary : salary;
    const salaryValue =
      salaryInput === undefined || salaryInput === null || salaryInput === ""
        ? null
        : Number(salaryInput);
    if (salaryValue !== null && (Number.isNaN(salaryValue) || salaryValue < 0)) {
      return res.status(400).send({ message: "salary must be a non-negative number." });
    }

    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;
    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      // password will be hashed by the model pre-save hook
      password,
      profilePic,
      dob: parsedDob ?? null,
      salary: salaryValue === null ? 0 : salaryValue,
      role: wantedRole,
    });

    await user.save();
    return res.status(201).send({
      message: "User registered successfully.",
      user: sanitizeUser(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send({ message: "Email is already in use." });
    }
    return res.status(500).send({ message: err.message || "Signup failed." });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "email and password are required." });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).exec();

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: user.id },
      config.secret,
      {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: 86400,
      }
    );

    user.isLoggedIn = true;
    user.lastLoginAt = new Date();
    await user.save();

    req.session.token = token;
    req.session.userId = String(user._id);
    return res.status(200).send({
      message: "Login successful.",
      accessToken: token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).send({ message: err.message || "Signin failed." });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).exec();
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    return res.status(200).send({ user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).send({ message: err.message || "Unable to load profile." });
  }
};

exports.signout = (req, res) => {
  try {
    const userId = req.session?.userId || getUserIdFromSessionToken(req);
    if (userId) {
      User.findByIdAndUpdate(userId, { isLoggedIn: false }).exec().catch(() => null);
    }

    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    return res.status(500).send({ message: err.message || "Signout failed." });
  }
};
