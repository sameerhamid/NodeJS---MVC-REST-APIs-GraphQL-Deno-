const express = require("express");

const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars").create;

const app = express();
// app.engine(
//   "hbs",
//   expressHbs({
//     defaultLayout: "main-layout",
//     extname: "hbs",
//   }).engine
// );

// app.set("view engine", "pug");
// app.set("view engine", "hbs");
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: true }));
const users = [];
app.get("/", (req, res, next) => {
  res.render("index", { pageTitle: "Add User" });
});

app.get("/users", (req, res, next) => {
  res.render("user", {
    pageTitle: "Users",
    users: users,
    hasUsers: users.length > 0,
  });
});
app.post("/add-user", (req, res, next) => {
  users.push({ name: req.body.username });
  res.redirect("/users");
});

app.listen(3000);
