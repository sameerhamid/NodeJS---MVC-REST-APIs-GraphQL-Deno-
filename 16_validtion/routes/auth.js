const path = require("path");
const express = require("express");
const authControllers = require("../controllers/auth");
const { check, body } = require("express-validator");

const User = require("../models/user");

const router = express.Router();

router.get("/login", authControllers.getLogin);
router.post("/login", authControllers.postLogin);
router.post("/logout", authControllers.postLogout);

router.get("/signup", authControllers.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email already  exists, please pick a different one"
            );
          }
        });
      }),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({
        min: 5,
      })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  authControllers.postSignup
);

router.get("/reset", authControllers.getReset);
router.post("/reset", authControllers.postReset);

router.get("/reset/:token", authControllers.getNewPassword);
router.post("/new-password", authControllers.postNewPassword);

module.exports = router;
