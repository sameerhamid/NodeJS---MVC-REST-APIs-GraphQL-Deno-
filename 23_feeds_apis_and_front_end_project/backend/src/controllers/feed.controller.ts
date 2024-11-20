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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: "Validation failed, entered data is incorrect.",
      errors: errors.array(),
    });
  }
  const { title, content } = req.body;

  const post = new Post({
    title,
    content,
    imageUrl: "/public/images/duck.jpg",
    creator: {
      name: "sameer",
    },
  });

  post
    .save()
    .then((result) => {
      console.log("Created post>>>", result);
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      console.log("Error creating post>>>", err);
    });
};
