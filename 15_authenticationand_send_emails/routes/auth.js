const path = require("path");
const express = require("express");
const authControllers = require("../controllers/auth");
const router = express.Router();

router.get("/login", authControllers.getLogin);
router.post("/login", authControllers.postLogin);
router.post("/logout", authControllers.postLogout);

router.get("/signup", authControllers.getSignup);

router.post("/signup", authControllers.postSignup);
router.get("/reset", authControllers.getReset);

router.post("/reset", authControllers.postReset);

module.exports = router;
