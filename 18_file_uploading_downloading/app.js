const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MonogoDBStore = require("connect-mongodb-session")(session);
// for protection cross site request forgery
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./controllers/error");

const User = require("./models/user");

// ?retryWrites=true&w=majority&appName=Cluster0
const MONGODB_URI =
  "mongodb+srv://codewithsamiir:NSXtwPvAKpa1RFra@cluster0.zfjhc.mongodb.net/shop-mongoose";
const app = express();

const store = new MonogoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ dest: "images" }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

// adding middleware to use it anywere to retereve the user

app.use((req, res, next) => {
  if (!req.session.user || !req.session.user._id) {
    req.user = null;
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log("Error fetching user>>>", err);
      next(new Error(err));
      // req.user = null;
      // next();
    });
});

// it will pass varibles to every route
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn ?? false;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.redirect("/500");
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    // this method return the first object from the database
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Test",
          email: "test@gmail.com",
          cart: { items: [] },
        });
        user.save();
      }
    });

    app.listen(3000);
    console.log("Connected to MongoDB!");
    console.log("Server running on port 3000");
  })
  .catch((error) => {
    console.log("Error while connecting...", error);
  });
