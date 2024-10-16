const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

const products = [];
// /admin/add-product => GET
// router.get("/add-product", (req, res, next) => {
//   res.sendFile(path.join(rootDir, "views", "add-product.html"));
// });

router.get("/add-product", (req, res, next) => {
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  // res.render("add-product", {
  //   docTitle: "Add Product",
  //   path: "admin/add-product",
  // });

  res.render("add-product", {
    pageTitle: "Add Product",
    path: "admin/add-product",
  });
});

// /admin/add-product => POST
router.post("/add-product", (req, res, next) => {
  console.log(req.body);
  products.push({ titile: req.body.title });
  res.redirect("/");
});

exports.router = router;
exports.products = products;
