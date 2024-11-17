import express from "express";
import bodyParser from "body-parser";
import feedRoutes from "./routes/feed.route";

const app = express();
// app.use(bodyParser.urlencoded({ extended: false })); //x-www-form-urlencoded

app.use(bodyParser.json()); // application/json

//--------------- GET /feed/posts ----------------
app.use("/feed", feedRoutes);

app.listen(8080);
