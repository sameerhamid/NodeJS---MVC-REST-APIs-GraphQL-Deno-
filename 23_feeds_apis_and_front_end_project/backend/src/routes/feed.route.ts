import exrpess from "express";
import { body } from "express-validator";

import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/feed.controller";
import isAuth from "../middlewares/isAuth.middleware";

const router = exrpess.Router();

/**
 * @swagger
 * /feed/posts:
 *   get:
 *     summary: Get all posts
 */
router.get("/posts", isAuth, getPosts);

/**
 * @swagger
 * /feed/post:
 *   post:
 *     summary: Create a post
 */
router.post(
  "/post",
  isAuth,
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
router.get("/post/:postId", isAuth, getPost);

/**
 * @swagger
 * /feed/post/{postId}:
 *   put:
 *     summary: Update a single post
 */
router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  updatePost
);

router.delete("/post/:postId", isAuth, deletePost);
export default router;
