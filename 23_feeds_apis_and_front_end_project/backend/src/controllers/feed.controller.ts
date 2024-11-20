import e, { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import Post from "../models/post.model";

/**
 * Retrieves a list of posts from the database
 * @function getPosts
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    posts: [
      {
        _id: 1,
        title: "First post",
        content: "This is the first post",
        imageUrl: "/public/images/duck.jpg",
        creator: {
          name: "sameer",
        },
        createdAt: new Date(),
      },
    ],
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
    const error: any = new Error(
      "Validation failed, entered data is incorrect."
    );
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;

  // Create a new post document
  const post = new Post({
    title,
    content,
    imageUrl: "/public/images/duck.jpg",
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
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
