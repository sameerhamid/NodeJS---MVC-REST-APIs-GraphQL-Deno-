import e, { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import Post, { PostType } from "../models/post.model";
import { ErrorType } from "../types/Error.type";
import { clearImage } from "../utils/clearImage.util";
import User, { UserType } from "../models/user.model";
import { Types } from "mongoose";
import { SocketIoServer } from "../utils/socket";

/**
 * Retrieves a paginated list of posts from the database.
 * @function getPosts
 * @param {Request} req - Express request object containing query parameters.
 * @param {Response} res - Express response object for sending the response.
 * @param {NextFunction} next - Express next middleware function for error handling.
 * @returns {Promise<void>} - Returns a JSON response with a message, list of posts, and total count of items.
 * @throws {ErrorType} - If an error occurs during the database query, passes the error to the next middleware.
 */
export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentPage = req.query.page ? +req.query.page : 1;
  let perPage = 2;

  try {
    const totalItems = (await Post.find().countDocuments()) ?? 0;
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    // Return the posts with a success message
    res.status(200).json({
      message: "Fetch posts successfully.",
      posts: posts,
      totalItems,
    });
  } catch (error) {
    const err = error as ErrorType;
    // If an error occurs, set the status code to 500 and pass it to the next middleware
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * Creates a new post in the database
 * @function createPost
 * @param {Request & { userId?: string }} req - Express request object with a userId property
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {ErrorType} If the validation fails or if no image was provided
 */
export const createPost = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  console.log(req.body, req.file);
  // Validate the input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return an error response if the validation fails
    const error: ErrorType = new Error(
      "Validation failed, entered data is incorrect."
    );
    error.statusCode = 422;
    throw error;
  }

  // Check if a file was uploaded
  if (!req.file) {
    console.log(req.file);
    // If no file was uploaded, throw an error
    const error: ErrorType = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  // Store the path of the uploaded image in a variable
  const imageUrl = req.file.path;
  const { title, content } = req.body;
  let creator: UserType;
  // Create a new post document
  const post = new Post({
    title,
    content,
    imageUrl: imageUrl,
    creator: req.userId,
    posts: [],
  });

  try {
    const newPost = await post.save();
    const user = await User.findById(req.userId);
    if (!user) {
      const error: ErrorType = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    user.posts.push(newPost);
    const postObject = post.toObject();
    await user.save();
    SocketIoServer.getIo().emit("posts", {
      action: "create",
      post: {
        ...postObject,
        creator: { _id: user._id, name: user.name, email: user.email },
      },
    });
    res.status(201).json({
      message: "Post created successfully!",
      post: newPost,
      creator: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    const err = error as ErrorType;
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * Retrieves a specific post from the database using its ID.
 * @function getPost
 * @param {Request & { userId?: string }} req - Express request object containing the postId parameter and optional userId.
 * @param {Response} res - Express response object to send the response.
 * @param {NextFunction} next - Express next middleware function for error handling.
 * @returns {Promise<void>} - Returns a JSON response with a message, the retrieved post, and the post creator's information.
 * @throws {ErrorType} - Throws an error if the post or user is not found, or if an error occurs during the database query.
 */
export const getPost = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error: ErrorType = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error: ErrorType = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Post fetched successfully.",
      post: post,
      creator: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    const err = error as ErrorType;
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    // Pass the error to the next middleware function
    next(err);
  }
};

/**
 * Updates an existing post in the database.
 * @function updatePost
 * @param {Request} req - Express request object with a userId property.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function for error handling.
 * @throws {ErrorType} - If the validation fails, or if the post or user is not found, or if an error occurs during the database query.
 */
export const updatePost = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  // Validate the input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return an error response if the validation fails
    const error: ErrorType = new Error(
      "Validation failed, entered data is incorrect."
    );
    error.statusCode = 422;
    throw error;
  }

  // Retrieve the post ID from the request parameters
  const { postId } = req.params;

  // Retrieve the title and content from the request body
  const { title, content } = req.body;

  // Retrieve the image URL from the request body
  let imageUrl = req.body.image;

  // If there is a file in the request, update the image URL
  if (req.file) {
    imageUrl = req.file.path;
  }

  // If there is no image URL, throw an error
  if (!imageUrl) {
    const error: ErrorType = new Error("No file picked.");
    error.statusCode = 422;
    throw error;
  }

  try {
    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error: ErrorType = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req?.userId?.toString()) {
      const error: ErrorType = new Error(
        "Only the creator can update the post."
      );
      error.statusCode = 403;
      throw error;
    }
    // If the image URL has changed, delete the old image file
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    // Update the post's title, content, and image URL
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    // Save the updated post to the database
    const updatedPost = await post.save();
    SocketIoServer.getIo().emit("posts", {
      action: "update",
      post: post,
    });
    // Respond with a success message and the updated post
    res.status(200).json({ message: "Post updated!", post: updatedPost });
  } catch (error) {
    const err = error as ErrorType;
    // Set the status code to 500 if not already set and pass the error to the next middleware
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

/**
 * Deletes a post from the database.
 * @function deletePost
 * @param {Request & { userId?: string }} req - Express request object containing the postId parameter and optional userId.
 * @param {Response} res - Express response object to send the response.
 * @param {NextFunction} next - Express next middleware function for error handling.
 * @returns {Promise<void>} - Returns a JSON response with a message.
 * @throws {ErrorType} - Throws an error if the post or user is not found, or if an error occurs during the database query.
 */

export const deletePost = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  // Retrieve the post ID from the request parameters
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error: ErrorType = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req?.userId?.toString()) {
      const error: ErrorType = new Error(
        "Only the creator can update the post."
      );
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(req.userId);
    if (!user) {
      const error: ErrorType = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    user.posts.pull(new Types.ObjectId(postId));
    await user.save();
    SocketIoServer.getIo().emit("posts", {
      action: "delete",
      post: postId,
    });
    res.status(200).json({ message: "Deleted post." });
  } catch (error) {
    const err = error as ErrorType;
    // Set the status code to 500 if not already set and pass the error to the next middleware
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
