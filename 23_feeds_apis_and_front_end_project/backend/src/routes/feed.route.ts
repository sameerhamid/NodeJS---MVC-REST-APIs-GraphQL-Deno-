import exrpess from "express";
import { body } from "express-validator";

import { createPost, getPost, getPosts } from "../controllers/feed.controller";

const router = exrpess.Router();

/**
 * @swagger
 * /feed/posts:
 *   get:
 *     summary: Get all posts
 */
router.get("/posts", getPosts);

/**
 * @swagger
 * /feed/post:
 *   post:
 *     summary: Create a post
 */
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);

/**
 * @swagger
 * /feed/post/{postId}:
 *   get:
 *     summary: Get a single post
 */
router.get("/post/:postId", getPost);

export default router;
