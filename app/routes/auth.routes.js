const { authJwt, verifySignUp, upload } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      upload.single("profilePic"),
      verifySignUp.checkDuplicateEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
  });

  function handleValidation(req, res, next) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({
        message: "Validation failed.",
        errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  }

  // Task 2 Auth endpoints (JWT, role forced to employee)
  app.post(
    "/api/auth/register",
    [
      authLimiter,
      upload.single("profilePic"),
      verifySignUp.checkDuplicateEmail,
      body("name").isString().trim().notEmpty(),
      body("email").isEmail().normalizeEmail(),
      body("password").isString().custom((value) => {
        // Strong password: 8+ chars, upper, lower, number.
        const v = String(value);
        const ok =
          v.length >= 8 &&
          /[a-z]/.test(v) &&
          /[A-Z]/.test(v) &&
          /\d/.test(v);
        if (!ok) throw new Error("Password must be 8+ chars and include upper, lower, and a number.");
        return true;
      }),
      body("dob").optional({ nullable: true }).isISO8601().toDate(),
      handleValidation,
    ],
    controller.register
  );

  app.post(
    "/api/auth/login",
    [
      authLimiter,
      body("email").isEmail().normalizeEmail(),
      body("password").isString().notEmpty(),
      handleValidation,
    ],
    controller.login
  );
  app.post("/api/auth/logout", controller.logout);

  app.post("/api/auth/signin", controller.signin);
  app.get("/api/auth/me", [authJwt.verifyToken], controller.me);

  app.post("/api/auth/signout", controller.signout);
};
