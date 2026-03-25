const db = require("../models");
const User = db.user;

/**
 * Prevent non-admin users from updating sensitive fields.
 * Blocks changes to `role` and `salary` (and legacy `monthlySalary`).
 */
const verifyAdminCanUpdateRoleAndSalary = async (req, res, next) => {
  try {
    const body = req.body || {};
    const wantsRole =
      Object.prototype.hasOwnProperty.call(body, "role") && body.role !== undefined;
    const wantsSalary =
      Object.prototype.hasOwnProperty.call(body, "salary") && body.salary !== undefined;
    const wantsLegacySalary =
      Object.prototype.hasOwnProperty.call(body, "monthlySalary") && body.monthlySalary !== undefined;

    if (!wantsRole && !wantsSalary && !wantsLegacySalary) return next();

    if (!req.userId) {
      return res.status(403).send({ message: "Not authorized." });
    }

    const user = await User.findById(req.userId).exec();
    if (!user) return res.status(404).send({ message: "User not found." });

    const role = String(user.role || "").toLowerCase();
    if (role !== "admin") {
      return res.status(403).send({
        message: "Only admin can modify role and salary fields.",
      });
    }

    return next();
  } catch (err) {
    return res.status(500).send({ message: err.message || "Authorization error." });
  }
};

module.exports = verifyAdminCanUpdateRoleAndSalary;

