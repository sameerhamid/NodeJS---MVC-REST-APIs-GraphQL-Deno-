import { NextFunction, Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User, { UserType } from "../models/user.model";
import { ErrorType } from "../types/Error.type";
import { processBcrypt } from "../utils/encryption.util";

/**
 * Handles user signup by validating input data, hashing the password,
 * creating a new user in the database, and returning a success response.
 * If validation fails, throws an error with status code 422.
 * If any other error occurs during the process, passes the error to the next middleware.
 *
 * @param {Request} req - Express request object containing user data.
 * @param {Response} res - Express response object for sending a response.
 * @param {NextFunction} next - Express next middleware function for error handling.
 */
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  const errorData: ValidationError[] = errors.array();
  if (!errors) {
    const error: ErrorType = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errorData;
    throw error;
  }
  const { email, name, password } = req.body;
  try {
    const hashedPass = await processBcrypt("hash", password);
    const user = new User({ email, password: hashedPass, name });
    await user.save();
    res.status(201).json({
      message: "User created!",
      userId: user._id,
    });
  } catch (error) {
    const err = error as ErrorType;
    // If there is an error, check if it has a status code
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    // Pass the error to the next middleware function
    next(err);
  }
};

/**
 * Handles user login by validating input data, verifying the password,
 * generating a JWT token, and returning a success response.
 * If validation fails, throws an error with status code 422.
 * If any other error occurs during the process, passes the error to the next middleware.
 *
 * @param {Request} req - Express request object containing user data.
 * @param {Response} res - Express response object for sending a response.
 * @param {NextFunction} next - Express next middleware function for error handling.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error: ErrorType = new Error("User not found.");
      error.statusCode = 401;
      throw error;
    }
    const isValid = await processBcrypt("verify", password, user.password);
    if (!isValid) {
      const error: ErrorType = new Error("Invalid password.");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email,
        userId: user?._id?.toString() ?? "",
      },
      "secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: token,
      userId: user._id,
    });
  } catch (error) {
    const err = error as ErrorType;
    // If there is an error, check if it has a status code
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    // Pass the error to the next middleware function
    next(err);
  }
};
