import fs from "fs";
import path from "path";
import e, { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import Post from "../models/post.model";
import { ErrorType } from "../types/Error.type";

/**
 * Retrieves a list of posts from the database
 * @function getPosts
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  // Retrieve all posts from the database
  Post.find()
    .then((posts) => {
      // Return the posts with a success message
      res
        .status(200)
        .json({ message: "Fetch posts successfully.", posts: posts });
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
export const createPost = (req: Request, res: Response, next: NextFunction) => {
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

  // Create a new post document
  const post = new Post({
    title,
    content,
    imageUrl: imageUrl,
    creator: {
      name: "sameer",
    },
  });

  // Save the post to the database
  post
    .save()
    .then((result) => {
      // Log the result of creating the post
      console.log("Created post>>>", result);
      // Return a successful response with the created post
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
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
export const updatePost = (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Deletes a file asynchronously and handles any errors
 * @param {string} filePath - the path to the file to delete
 */
const clearImage = (filePath: string): void => {
  // Construct the full file path
  filePath = path.join(__dirname, "../..", filePath);

  // Delete the file asynchronously and handle any errors
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting the file:", err);
    }
  });
};
