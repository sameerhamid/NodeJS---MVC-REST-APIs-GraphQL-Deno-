import { NextFunction, Request, Response } from "express";

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
        id: 1,
        title: "First post",
        content: "This is the first post",
      },
      {
        id: 2,
        title: "Second post",
        content: "This is the second post",
      },
      {
        id: 3,
        title: "Third post",
        content: "This is the third post",
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
  const { title, content } = req.body;

  // create post in db
  res.status(201).json({
    message: "Post created successfully!",
    post: {
      id: new Date().getTime(),
      title,
      content,
    },
  });
};
