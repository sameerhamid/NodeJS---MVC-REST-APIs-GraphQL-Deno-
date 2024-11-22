import { NextFunction, Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import User from "../models/user.model";
import { ErrorType } from "../types/Error.type";
import { processBcrypt } from "../utils/Encryption.utils";

export const signUp = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  const errorData: ValidationError[] = errors.array();
  if (!errors) {
    const error: ErrorType = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errorData;
    throw error;
  }
  const { email, name, password } = req.body;
  processBcrypt("hash", password)
    .then((hashedPass) => {
      const user = new User({ email, password: hashedPass, name });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "User created!",
        userId: result._id,
      });
    })
    .catch((err) => {
      // If there is an error, check if it has a status code
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      // Pass the error to the next middleware function
      next(err);
    });
};
