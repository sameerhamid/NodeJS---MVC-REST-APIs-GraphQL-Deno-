const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./util/database");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// it syncs the tables if not exist then create them on the basis of models
sequelize
  .sync()
  .then((result) => {
    // console.log("result>>>>", result);
    app.listen(3000);
  })
  .catch((error) => {
    console.log("Error connecting to database>>>>> ", error);
    process.exit(1);
  });
