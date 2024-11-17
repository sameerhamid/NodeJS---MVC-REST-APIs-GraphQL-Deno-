import express from "express";
import bodyParser from "body-parser";
import feedRoutes from "./routes/feed.route";

const app = express();
// app.use(bodyParser.urlencoded({ extended: false })); //x-www-form-urlencoded

app.use(bodyParser.json()); // application/json

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

app.listen(8080);
