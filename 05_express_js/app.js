const http = require("http");

const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));

// app.use("/", (req, res, next) => {
//   res.send("This always runs!");
//   next();
// });

app.use("/add-product", (req, res, next) => {
  res.send(`
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <form action="/product" method="POST">
        <input type="text" name="title" />
        <button type="submit">Add product</button>
    </form>
</body>

</html>
    `);
  next(); // allows the request to continue to the next middleware in line
});

app.use("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});
app.use("/", (req, res, next) => {
  res.send(`<h1>Hello from express</h1>`);
});
// const server = http.createServer(app);

// server.listen(3000);
// --------- it does both things creats server and listens
app.listen(3000);
