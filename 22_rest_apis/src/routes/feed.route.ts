import exrpess from "express";

import { createPost, getPosts } from "../controllers/feed.controller";

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
router.post("/post", createPost);

export default router;
