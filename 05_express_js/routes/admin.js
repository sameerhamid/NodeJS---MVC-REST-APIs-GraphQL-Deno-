const express = require("express");

const router = express.Router();

router.post("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

router.get("/add-product", (req, res, next) => {
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

module.exports = router;
