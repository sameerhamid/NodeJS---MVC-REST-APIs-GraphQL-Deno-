import e, { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import Post from "../models/post.model";
import { ErrorType } from "../types/Error.type";
import { clearImage } from "../utils/clearImage.util";
import User, { UserType } from "../models/user.model";

/**
 * Retrieves a list of posts from the database
 * @function getPosts
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  const currentPage = req.query.page ? +req.query.page : 1;
  let perPage = 2;
  let totalItems = 0;
  Post.find()
    .countDocuments()
    .then((numPosts) => {
      totalItems = numPosts;
      // Retrieve all posts from the database
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      // Return the posts with a success message
      res.status(200).json({
        message: "Fetch posts successfully.",
        posts: posts,
        totalItems,
      });
    })
    .catch((err: ErrorType) => {
      // If an error occurs, set the status code to 500 and pass it to the next middleware
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Creates a new post in the database
 * @function createPost
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const createPost = (
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

  // Check if a file was uploaded
  if (!req.file) {
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

  // Save the post to the database
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      if (!user) {
        const error: ErrorType = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      // Return a successful response with the created post
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name, email: creator.email },
      });
    })
    .catch((err: ErrorType) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Retrieves a post from the database
 * @function getPost
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getPost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId;

  // Retrieve a post from the database by it's ObjectId
  Post.findById(postId)
    .then((post) => {
      // If the post does not exist, throw an error
      if (!post) {
        const error: ErrorType = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }

      // Return a successful response with the post
      res.status(200).json({
        message: "Post fetched.",
        post: post,
      });
    })
    .catch((err: ErrorType) => {
      // If there is an error, check if it has a status code
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      // Pass the error to the next middleware function
      next(err);
    });
};

/**
 * Updates a post in the database
 * @function updatePost
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const updatePost = (
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

  // Find the post by ID
  Post.findById(postId)
    .then((post) => {
      // If the post is not found, throw a 404 error
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

      // If the image URL has changed, delete the old image file
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      // Update the post's title, content, and image URL
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      // Save the updated post to the database
      return post.save();
    })
    .then((result) => {
      // Respond with a success message and the updated post
      res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((err: ErrorType) => {
      // Set the status code to 500 if not already set and pass the error to the next middleware
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const deletePost = (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  // Retrieve the post ID from the request parameters
  const { postId } = req.params;

  // Find the post by ID
  Post.findById(postId)
    .then((post) => {
      // Check logged in user
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
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      console.log("Post deleted successfully", result);
      res.status(200).json({ message: "Deleted post." });
    })
    .catch((err: ErrorType) => {
      // Set the status code to 500 if not already set and pass the error to the next middleware
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
