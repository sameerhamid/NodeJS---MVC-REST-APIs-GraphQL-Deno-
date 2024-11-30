import { Request } from "express";
import validator from "validator";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { ErrorType } from "../types/Error.type";
import { processBcrypt } from "../utils/encryption.util";

export type ErrorMsgType = {
  message: string;
};

interface UserInputData {
  email: string;
  password: string;
  name: string;
}

/**
 * Creates a new user
 * @param userInput - The user input data
 * @param req - The express request object
 * @returns The created user data
 * @throws {ErrorType} - If the user already exists
 */
const resolvers = {
  /*************  ✨ Codeium Command ⭐  *************/
  /**
   * Creates a new user
   * @param userInput - The user input data
   * @param req - The express request object
   * @returns The created user data
   * @throws {ErrorType} - If the user already exists
   */
  /******  8e2417e8-965b-43ff-abfe-89cb01f03ae0  *******/ createUser: async (
    { userInput }: { userInput: UserInputData },
    req: Request
  ) => {
    const { email, password, name } = userInput;
    const errors: ErrorMsgType[] = [];

    if (!validator.isEmail(email)) {
      errors.push({
        message: "Email is invalid",
      });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({
        message: "Password too short",
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      errors.push({
        message: "User already exists",
      });
    }

    if (errors.length > 0) {
      const newError: ErrorType = new Error("Invalid input");
      newError.data = errors;
      newError.statusCode = 422;
      throw newError;
    }

    const hashedPass = await processBcrypt("hash", password);
    console.log(hashedPass);
    const user = new User({
      email,
      name,
      password: hashedPass,
    });

    const createdUser = await user.save();
    const createdUserData = createdUser.toObject();
    return {
      ...createdUserData,
      _id: createdUserData._id.toString(),
    };
  },

  login: async (
    { email, password }: { email: string; password: string },
    req: Request
  ) => {
    const existingUser = await User.findOne({ email: email });
    const errors: ErrorMsgType[] = [];
    if (!existingUser) {
      errors.push({ message: "User doesn't exist" });
    }

    const isEqualPass = await processBcrypt(
      "verify",
      password,
      existingUser?.password ?? ""
    );

    if (!isEqualPass) {
      errors.push({ message: "Password is incorrect" });
    }

    if (errors.length > 0) {
      const newError: ErrorType = new Error("Invalid input");
      newError.data = errors;
      newError.statusCode = 422;
      throw newError;
    }

    const token = jwt.sign(
      {
        userId: existingUser?._id.toString(),
        email: existingUser?.email,
      },
      "secret",
      {
        expiresIn: "1h",
      }
    );

    return {
      token,
      userId: existingUser?._id.toString(),
    };
  },
};

export default resolvers;
