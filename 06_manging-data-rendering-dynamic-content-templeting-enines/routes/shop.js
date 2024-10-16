const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

const adminData = require("./admin");

// router.get("/", (req, res, next) => {
//   res.sendFile(path.join(rootDir, "views", "shop.html"));
// });

router.get("/", (req, res, next) => {
  const products = adminData.products;
  console.log(products);
  // res.render("shop", { prods: products, docTitle: "Shop", path: "/" });
  res.render("shop", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
    hasProducts: products.length > 0,
    activeShop: true,
    productCss: true,
  });
});

module.exports = router;
