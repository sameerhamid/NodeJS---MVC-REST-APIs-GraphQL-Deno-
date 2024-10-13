const http = require("http");

const express = require("express");

const app = express();

app.use("/", (req, res, next) => {
  res.send("This always runs!");
  next();
});

app.use("/add-product", (req, res, next) => {
  console.log("in the add product");
  res.send(`<h1>Add produect</h1>`);
  next(); // allows the request to continue to the next middleware in line
});

app.use("/", (req, res, next) => {
  console.log("in the second middleware");
  res.send(`<h1>Hello from express</h1>`);
});
// const server = http.createServer(app);

// server.listen(3000);
// --------- it does both things creats server and listens
app.listen(3000);
