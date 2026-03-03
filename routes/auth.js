const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const User = require("../models/user");

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password", "Please enter a password with at least 5 characters")
      .isLength({ min: 5 })
      .trim(),
  ],
  authController.postLogin,
);
router.post("/logout", authController.postLogout);
router.get("/signup", authController.getSignup);
//check() is a middleware that validates the email and password before reaching the controller and inject errors in the request if there are any
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email already exists, please pick a different one",
            );
          }
          return true;
        });
      }),
    body("password", "Please enter a password with at least 5 characters")
      .isLength({ min: 5 })
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match");
        }
        return true;
      }),
  ],
  authController.postSignup,
);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/new-password/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
