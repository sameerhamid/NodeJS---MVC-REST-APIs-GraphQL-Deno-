import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ErrorType } from "../types/Error.type";
import mongoose from "mongoose";
import User from "../models/user.model";

interface TokenType {
  email: string;
  userId: string;
  iat: number;
  exp: number;
}

/**
 * This middleware verifies the authorization header and checks if the request is authenticated.
 *
 * The middleware will throw an error with a status code of 401 if the token is invalid,
 * if the token does not exist or if the token is empty.
 *
 * The middleware will also throw an error with a status code of 401 if the user is not authenticated.
 *
 * If the token is valid and the user is authenticated, the middleware will add a new property
 * called "userId" to the request object with the value of the user id.
 *
 * The middleware will then call the next middleware in the stack.
 *
 * @param {Request} req - Express request object
 * @param {Response} _res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */

const isAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error: ErrorType = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader?.split(" ")[1] as string;

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secret") as TokenType;
  } catch (error) {
    const myError = error as ErrorType;
    myError.statusCode = 401;
    throw myError;
  }

  if (!decodedToken) {
    const error: ErrorType = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const id = new mongoose.Types.ObjectId(decodedToken.userId);
  const user = await User.findById(id);

  User.findById(id)
    .then((user) => {
      if (!user) {
        const error: ErrorType = new Error("Not authenticated.");
        error.statusCode = 401;
        next(error);
      }
    })
    .catch((error) => {
      const myError = error as ErrorType;
      myError.statusCode = 401;
      throw myError;
    });

  (req as Request & { userId: string }).userId = decodedToken.userId;
  next();
};

export default isAuth;
