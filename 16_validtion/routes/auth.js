const path = require("path");
const express = require("express");
const authControllers = require("../controllers/auth");
const { check, body } = require("express-validator");

const router = express.Router();

router.get("/login", authControllers.getLogin);
router.post("/login", authControllers.postLogin);
router.post("/logout", authControllers.postLogout);

router.get("/signup", authControllers.getSignup);
router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Please enter a valid email."),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({
        min: 5,
      })
      .isAlphanumeric(),
  ],
  authControllers.postSignup
);

router.get("/reset", authControllers.getReset);
router.post("/reset", authControllers.postReset);

router.get("/reset/:token", authControllers.getNewPassword);
router.post("/new-password", authControllers.postNewPassword);

module.exports = router;
