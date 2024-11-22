import express from "express";
import { body } from "express-validator";
import { login, signUp } from "../controllers/auth.controller";
import User from "../models/user.model";

const router = express.Router();

/**
 * POST /signup
 * @summary Create or update a user
 * @description Register or update  new user with an email, password, and name.
 * @param {string} email - The email address of the user
 * @param {string} password - The password of the user
 * @param {string} name - The name of the user

 */
router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "Email already exists, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  signUp
);

/**
 * POST /login
 * @summary Login a user
 * @description Login a user with email and password
 * @param {string} email - The email address of the user
 * @param {string} password - The password of the user
 */
router.post("/login", login);
export default router;
