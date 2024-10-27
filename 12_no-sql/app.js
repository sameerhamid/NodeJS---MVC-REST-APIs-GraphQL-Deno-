const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const { mongoConnect } = require("./util/database");
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
  User.findById("671cc99b42df88a6156c14af")
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

mongoConnect() // Call mongoConnect
  .then((message) => {
    console.log(message);
    console.log("app listening on port 3000");
    // Start the server after successful connection
    app.listen(3000);
  })
  .catch((error) => {
    console.error(error);
  });
