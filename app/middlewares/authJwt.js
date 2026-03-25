const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const { isTokenBlacklisted } = require("../utils/tokenBlacklist");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = req.session?.token || bearerToken;

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  if (isTokenBlacklisted(token)) {
    return res.status(401).send({ message: "Token is logged out." });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    const userId = decoded.userId || decoded.id;
    User.findById(userId).exec((dbErr, user) => {
      if (dbErr) {
        return res.status(500).send({ message: dbErr.message || "Authorization error." });
      }
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }
      req.userId = userId;
      // Attach a safe user object (without password) to request.
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        dob: user.dob,
        salary: user.salary,
        role: user.role,
      };
      next();
    });
  });
};

const requireRole = (roleName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).exec();
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      const hasRole = String(user.role || "").toLowerCase() === roleName;
      if (!hasRole) {
        return res.status(403).send({ message: `Require ${roleName} role!` });
      }

      req.currentUser = user;
      next();
    } catch (err) {
      res.status(500).send({ message: err.message || "Authorization error." });
    }
  };
};

const isAdmin = requireRole("admin");
const isManager = requireRole("manager");
const isEmployee = requireRole("employee");

const authJwt = {
  verifyToken,
  isAdmin,
  isManager,
  isEmployee,
};
module.exports = authJwt;
