const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
      },
      profilePic: {
        type: String,
        default: null,
      },
      dob: {
        type: Date,
        default: null,
      },
      monthlySalary: {
        type: Number,
        default: null,
        min: 0,
      },
      role: {
        type: String,
        enum: ["employee", "manager", "admin"],
        required: true,
        default: "employee",
        trim: true,
        lowercase: true,
      },
      isLoggedIn: {
        type: Boolean,
        default: false,
      },
      lastLoginAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  )
);

module.exports = User;
