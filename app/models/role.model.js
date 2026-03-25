const mongoose = require("mongoose");

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  })
);

module.exports = Role;
