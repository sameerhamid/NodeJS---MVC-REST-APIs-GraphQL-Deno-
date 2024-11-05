const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MonogoDBStore = require("connect-mongodb-session")(session);

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

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// adding middleware to use it anywere to retereve the user

app.use((req, res, next) => {
  User.findById("6722e97b09afbe1bfae25f55")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log("Error fetching user>>>", err);
      req.user = null;
      next();
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

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
