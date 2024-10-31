const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");

const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

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

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://codewithsamiir:NSXtwPvAKpa1RFra@cluster0.zfjhc.mongodb.net/shop-mongoose?retryWrites=true&w=majority&appName=Cluster0"
  )
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
