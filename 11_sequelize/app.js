const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");
const Product = require("./models/product");
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
  User.findByPk(1)
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

// set relation between tables

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

// it syncs the tables if not exist then create them on the basis of models
sequelize
  .sync()
  // .sync({ force: true }) // this will force to already created products to add relation
  .then((result) => {
    // console.log("result>>>>", result);
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "test", email: "test@gmail.com" });
    }
    return user;
  })
  .then((user) => {
    console.log("user>>>", user.dataValues);
    app.listen(3000);
  })
  .catch((error) => {
    console.log("Error connecting to database>>>>> ", error);
    process.exit(1);
  });
