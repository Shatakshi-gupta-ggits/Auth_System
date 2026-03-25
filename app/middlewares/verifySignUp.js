const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
  User.findOne({ email: (req.body.email || "").toLowerCase().trim() }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err.message || "Database error." });
      return;
    }

    if (user) {
      res.status(400).send({ message: "Failed! Email is already in use!" });
      return;
    }

    next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (!req.body.role) {
    next();
    return;
  }

  if (!ROLES.includes(req.body.role)) {
    res.status(400).send({
      message: `Failed! Role ${req.body.role} does not exist!`,
    });
    return;
  }

  next();
};

const verifySignUp = {
  checkDuplicateEmail,
  checkRolesExisted,
};

module.exports = verifySignUp;
