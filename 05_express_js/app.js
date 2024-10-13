const path = require("path");
const http = require("http");

const express = require("express");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const app = express();
app.use(express.urlencoded({ extended: true }));
// with this middleware users will access the public path
app.use(express.static(path.join(__dirname, "public")));
// app.use("/admin", adminRoutes);
app.use(adminRoutes);
app.use(shopRoutes);

// app.use("/", (req, res, next) => {
//   res.send("This always runs!");
//   next();
// });

// app.use("/add-product", (req, res, next) => {
//   res.send(`
//     <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Document</title>
// </head>

// <body>
//     <form action="/product" method="POST">
//         <input type="text" name="title" />
//         <button type="submit">Add product</button>
//     </form>
// </body>

// </html>
//     `);
//   next(); // allows the request to continue to the next middleware in line
// });

// app.use("/product", (req, res, next) => {
//   console.log(req.body);
//   res.redirect("/");
// });

// another way writing and the benifit is it will only run for get requests
// app.post("/product", (req, res, next) => {
//   console.log(req.body);
//   res.redirect("/");
// });
// app.use("/", (req, res, next) => {
//   res.send(`<h1>Hello from express</h1>`);
// });

// will use to catch for other routes
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});
// const server = http.createServer(app);

// server.listen(3000);

// --------- it does both things creats server and listens
app.listen(3000);
