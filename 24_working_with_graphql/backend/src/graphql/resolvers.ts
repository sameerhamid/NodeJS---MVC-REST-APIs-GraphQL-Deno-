import { Request } from "express";
import validator from "validator";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import Post from "../models/post.model";
import { ErrorType } from "../types/Error.type";
import { processBcrypt } from "../utils/encryption.util";
import { clearImage } from "../utils/clearImage.util";

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

  /**
   * Creates a new post in the database.
   * @function createPost
   * @param {Object} postInput - Contains the post data including title, content, and imageUrl.
   * @param {Request & { isAuth?: boolean; userId?: string }} req - Express request object with authentication status and userId.
   * @returns {Promise<Object>} - Returns a promise that resolves to the created post data with timestamps and creator info.
   * @throws {ErrorType} - If validation fails or if the user is not authenticated or invalid.
   */
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

  /**
   * Get all posts
   * @param _args - unused
   * @param req - request object
   * @returns an object with a posts array and a totalPosts number
   * @throws an error if the user is not authenticated
   */
  posts: async (
    { page }: { page: number },
    req: Request & { isAuth?: boolean }
  ) => {
    const errors: ErrorMsgType[] = [];
    console.log("isAuth", req.isAuth);
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated" });
    }

    if (errors.length > 0) {
      const newError: ErrorType = new Error("Invalid input");
      newError.data = errors;
      newError.statusCode = 422;
      throw newError;
    }
    let currentPage = page ?? 1;
    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("creator")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return {
      posts: posts.map((post) => {
        const createdPostData = post.toObject();
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
      }),
      totalPosts: totalPosts ?? 0,
    };
  },

  /**
   * Get a single post by id
   * @param {string} id - The id of the post to get
   * @param {Request & { isAuth?: boolean; userId?: string }} req - The express request object
   * @returns {Promise<Object>} - The post data with the id, title, content, imageUrl, createdAt, and updatedAt.
   * @throws {ErrorType} - If the post is not found or if the user is not authenticated.
   */
  post: async (
    { id }: { id: string },
    req: Request & { isAuth?: boolean; userId?: string }
  ) => {
    const errors: ErrorMsgType[] = [];
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated" });
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      errors.push({ message: "Post not found" });
    }
    if (errors.length > 0) {
      const newError: ErrorType = new Error("Invalid input");
      newError.data = errors;
      newError.statusCode = 422;
      throw newError;
    }
    const postData = post?.toObject();
    return {
      ...postData,
      _id: postData?._id.toString(),
      createdAt: postData?.createdAt.toString(),
      updatedAt: postData?.updatedAt.toString(),
    };
  },

  /**
   * Update a post
   * @param {string} id - The id of the post to update
   * @param {PostInputData} postInput - The data to update the post with
   * @param {Request & { isAuth?: boolean; userId?: string }} req - The express request object
   * @returns {Promise<Object>} - The post data with the id, title, content, imageUrl, createdAt, and updatedAt.
   * @throws {ErrorType} - If the post is not found, if the user is not authenticated, or if the user is not authorized to update the post.
   */
  updatePost: async (
    { id, postInput }: { id: string; postInput: PostInputData },
    req: Request & { isAuth?: boolean; userId?: string }
  ) => {
    const errors: ErrorMsgType[] = [];
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated" });
    }

    const post = await Post.findById(id).populate("creator");
    if (!post || post === null) {
      errors.push({ message: "Post not found" });
    }

    if (post?.creator._id.toString() !== req.userId) {
      errors.push({ message: "Not authorized" });
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
    post!.title = postInput.title;
    post!.content = postInput.content;
    if (postInput.imageUrl !== "undefined") {
      post!.imageUrl = postInput.imageUrl;
    }

    const updatedPost = await post!.save();
    const createdPostData = updatedPost.toObject();
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

  deletePost: async (
    { id }: { id: string },
    req: Request & { isAuth?: boolean; userId?: string }
  ) => {
    const errors: ErrorMsgType[] = [];
    if (!req.isAuth) {
      errors.push({ message: "Not authenticated" });
    }

    const post = await Post.findById(id).populate("creator");

    if (!post || post === null) {
      errors.push({ message: "Post not found!" });
    }

    if (post?.creator._id.toString() !== req.userId?.toString()) {
      errors.push({ message: "Not authorized" });
    }

    if (errors.length > 0) {
      const newError: ErrorType = new Error("Invalid input");
      newError.data = errors;
      newError.statusCode = 422;
      throw newError;
    }
    clearImage(post!.imageUrl);
    await Post.findByIdAndDelete(id);
    const user = await User.findById(req.userId);

    user!.posts.pull(id);
    await user!.save();
    return true;
  },
};

export default resolvers;
