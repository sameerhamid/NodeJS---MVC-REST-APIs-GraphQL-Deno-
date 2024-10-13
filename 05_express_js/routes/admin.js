const path = require("path");
const express = require("express");

const router = express.Router();

const rootDir = require("../utils/path");
// ------ this route is /admin/product
router.post("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

// ------ this route is /admin/add-product
// router.get("/add-product", (req, res, next) => {
//   res.send(`
//     <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Document</title>
// </head>

// <body>
//     <form action="/admin/product" method="POST">
//         <input type="text" name="title" />
//         <button type="submit">Add product</button>
//     </form>
// </body>

// </html>
//     `);
//   next(); // allows the request to continue to the next middleware in line
// });

// router.get("/add-product", (req, res, next) => {
//   res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
// });

router.get("/add-product", (req, res, next) => {
  res.sendFile(path.join(rootDir, "../", "views", "add-product.html"));
});

module.exports = router;
