import path from "path";
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import { graphqlHTTP } from "express-graphql";
import graphlSchema from "./graphql/schema";
import graphlResolver from "./graphql/resolvers";

import { ErrorType } from "./types/Error.type";
import { SocketIoServer } from "./utils/socket";

const app = express();

/**
 * Multer storage engine configuration.  This configuration is used to
 * define how Multer stores the uploaded files.
 */
const fileStorage = multer.diskStorage({
  /**
   * Multer's destination callback.  This callback is used to specify the
   * directory where Multer should store the uploaded file.
   * @param {Request} _req - The Express request object.
   * @param {Express.Multer.File} file - The file being uploaded.
   * @param {(err: Error | null, filename: string) => void} cb - The callback
   *   function.  The first argument is an error (or null if the file was
   *   stored successfully), and the second argument is the name of the
   *   file that was stored.
   */
  destination: (_req, _file, cb) => {
    cb(null, "./public/images");
  },
  /**
   * Multer's filename callback.  This callback is used to specify the
   * filename that Multer should give to the uploaded file.
   * @param {Request} _req - The Express request object.
   * @param {Express.Multer.File} file - The file being uploaded.
   * @param {(err: Error | null, filename: string) => void} cb - The callback
   *   function.  The first argument is an error (or null if the file was
   *   stored successfully), and the second argument is the filename that
   *   was given to the file.
   *
   * This function prepends the current timestamp to the filename to ensure
   * that multiple files with the same name can be uploaded.
   */
  filename: (_req, file: Express.Multer.File, cb) => {
    const timestamp = new Date().toISOString().replace(/:/g, "-"); // Replace colons with dashes
    cb(null, `${timestamp}_${file.originalname}`);
  },
});

/**
 * Multer file filter callback.  This callback is used to decide which files
 * are allowed to be uploaded.
 * @param {Request} req - The Express request object.
 * @param {Express.Multer.File} file - The file being uploaded.
 * @param {(err: Error | null, filename: string | boolean) => void} cb - The
 *   callback function.  The first argument is an error (or null if the file
 *   was allowed), and the second argument is a boolean indicating whether the
 *   file was allowed.
 *
 * This function checks the mime type of the file to ensure that it is a valid
 * image file.  If the mime type is not one of the supported mime types, the
 * file is not allowed.
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (err: Error | null, allowed: boolean) => void
) => {
  const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded({ extended: false })); //x-www-form-urlencoded

// parse application/json
app.use(bodyParser.json());

app.use(
  //@ts-ignore
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// Serve static images from the public/images folder
// This allows the frontend to access the images when rendering posts
app.use(
  "/public/images",
  express.static(path.join(__dirname, "../public/images"))
);

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

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphlSchema,
    rootValue: graphlResolver,
    graphiql: true,
    customFormatErrorFn: (error) => {
      if (!error.originalError) {
        return error;
      }
      const data = error.originalError;
      return data;
    },
  })
);

// Custom error handling middleware
// This middleware catches any errors that are thrown from the
// other middleware functions and routes and sends a JSON response
// with the status code and error message
app.use((error: ErrorType, req: Request, res: Response, next: NextFunction) => {
  console.log("error middleware", error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error?.data ?? [];
  res.status(status).json({ message: message, data });
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
