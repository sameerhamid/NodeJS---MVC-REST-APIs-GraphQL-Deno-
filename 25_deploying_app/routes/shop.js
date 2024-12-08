const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

const isAuth = require("../middleware/is-auth");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.get("/orders", isAuth, shopController.getOrders);

// router.post("/create-order", isAuth, shopController.postOrders);

router.post("/cart-delete-item", isAuth, shopController.postCartDelete);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/checkout/cancel", isAuth, shopController.getCheckout);

router.get("/checkout/success", isAuth, shopController.getCheckoutSuccess);

module.exports = router;
