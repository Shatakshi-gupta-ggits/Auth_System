const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const upload = require("./upload");
const verifyAdminRoleAndSalary = require("./verifyAdminRoleAndSalary");

module.exports = {
  authJwt,
  verifySignUp,
  upload,
  verifyAdminRoleAndSalary,
};
