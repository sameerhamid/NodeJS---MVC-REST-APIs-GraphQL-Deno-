import { Request } from "express";
import validator from "validator";
import User from "../models/user.model";
import { ErrorType } from "../types/Error.type";
import { processBcrypt } from "../utils/encryption.util";

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
  createUser: async (
    { userInput }: { userInput: UserInputData },
    req: Request
  ) => {
    const { email, password, name } = userInput;
    const errors: ErrorType[] = [];

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

    if (errors.length > 0) {
      const newError = new Error("Invalid input");
      throw newError;
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const error: ErrorType = new Error("User already exists");
      throw error;
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
};

export default resolvers;
