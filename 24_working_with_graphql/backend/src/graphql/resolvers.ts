import { Request } from "express";
import validator from "validator";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Post from "../models/post.model";
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

interface PostInputData {
  title: string;
  content: string;
  imageUrl: string;
}

/**
 * Creates a new user
 * @param userInput - The user input data
 * @param req - The express request object
 * @returns The created user data
 * @throws {ErrorType} - If the user already exists
 */
const resolvers = {
  /**
   * Creates a new user
   * @param userInput - The user input data
   * @param req - The express request object
   * @returns The created user data
   * @throws {ErrorType} - If the user already exists
   */
  createUser: async (
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

  /**
   * Login a user
   * @param {Object} input - Must contain two properties: `email` and `password`
   * @param {string} input.email - The email address of the user
   * @param {string} input.password - The password of the user
   * @param {Request} req - The express request object
   * @returns {Promise<Object>} - Returns a promise that resolves to an object with two properties: `token` and `userId`
   * @throws {ErrorType} - If the user doesn't exist or the password is incorrect
   */
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

  createPost: async (
    { postInput }: { postInput: PostInputData },
    req: Request & { isAuth?: boolean; userId?: string }
  ) => {
    const errors: ErrorMsgType[] = [];
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated" });
    }
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }

    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid." });
    }

    if (
      validator.isEmpty(postInput.imageUrl) ||
      !validator.isLength(postInput.imageUrl, { min: 5 })
    ) {
      errors.push({ message: "Image URL is invalid." });
    }

    if (errors.length > 0) {
      const newError: ErrorType = new Error("Invalid input");
      newError.data = errors;
      newError.statusCode = 422;
      throw newError;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      errors.push({ message: "Invalid User." });
    }

    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });

    const createdPost = await post.save();
    user?.posts.push(createdPost);

    await user?.save();

    const createdPostData = createdPost.toObject();
    // Add post to user
    return {
      ...createdPostData,
      _id: createdPostData._id.toString(),
      createdAt: createdPostData.createdAt.toString(),
      updatedAt: createdPostData.updatedAt.toString(),
      creator: {
        ...createdPostData.creator,
        _id: createdPostData.creator._id.toString(),
      },
    };
  },
};

export default resolvers;
