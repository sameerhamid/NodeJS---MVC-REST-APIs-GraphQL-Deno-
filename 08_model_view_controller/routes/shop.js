const path = require("path");

const express = require("express");

const rootDir = require("../util/path");
const adminData = require("./admin");

const {
  getProducts,
  getIndex,
  getCart,
  getCheckout,
  getOrders,
} = require("../controllers/shop.controller");

const router = express.Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/cart", getCart);

router.get("/orders", getOrders);

router.get("/checkout", getCheckout);

module.exports = router;
