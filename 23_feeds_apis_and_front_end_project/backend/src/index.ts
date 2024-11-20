import path from "path";
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import feedRoutes from "./routes/feed.route";
import { ErrorType } from "./types/Error.type";

const app = express();
// app.use(bodyParser.urlencoded({ extended: false })); //x-www-form-urlencoded

// parse application/json
app.use(bodyParser.json());

// Serve static images from the public/images folder
// This allows the frontend to access the images when rendering posts
app.use("/images", express.static(path.join(__dirname, "../public/images")));

/**
 * Middleware to set CORS headers for all incoming requests
 * @function
 * @param {Request} _req - Express request object (unused)
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST , PATCH, DELETE , PUT"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//--------------- GET /feed/posts ----------------
app.use("/feed", feedRoutes);

// Custom error handling middleware
// This middleware catches any errors that are thrown from the
// other middleware functions and routes and sends a JSON response
// with the status code and error message
app.use((error: ErrorType, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

const PORT = 8080;

// Connect to the MongoDB database
mongoose
  .connect(
    "mongodb+srv://codewithsamiir:NSXtwPvAKpa1RFra@cluster0.zfjhc.mongodb.net/feeds"
  )
  .then((result) => {
    // Successfully connected to the MongoDB database
    console.log("Connected to MongoDB!");
    // Start the server and listen on the specified port
    app.listen(PORT, () => {
      console.log("Server is running on port " + PORT);
    });
  })
  .catch((err) => {
    // Log the error if the connection to MongoDB fails
    console.log("Error while connecting to MongoDB...", err);
  });
