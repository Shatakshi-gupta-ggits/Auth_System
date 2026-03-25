const { authJwt, upload, verifyAdminRoleAndSalary } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

  app.get(
    "/api/test/manager",
    [authJwt.verifyToken, authJwt.isManager],
    controller.managerBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  // Manager can view their team (employees) - view-only.
  app.get(
    "/api/manager/team",
    [authJwt.verifyToken, authJwt.isManager],
    controller.managerTeam
  );

  app.patch(
    "/api/user/me",
    [authJwt.verifyToken, verifyAdminRoleAndSalary, upload.single("profilePic")],
    controller.updateMe
  );

  app.put(
    "/api/user/change-password",
    [authJwt.verifyToken],
    controller.changePasswordMe
  );
};
