const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const expressHb = require("express-handlebars");
const app = express();

// when we want to use we have to use .handlebars as we have it here
app.engine("handlebars", expressHb());
app.set("view engine", "handlebars");
// we want to compile dynamic templete with the pug engine
// app.set("view engine", "pug");
app.set("views", "views");

const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminData.router);
app.use(shopRoutes);

// app.use((req, res, next) => {
//   res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
// });

// usage of pug dynamically page
// app.use((req, res, next) => {
//   res.status(404).render("404", { docTitle: "Page Not Found" });
// });

// usage of express handlebars

app.use((req, res, next) => {
  res
    .status(404)
    .render("404", { pageTitle: "Page Not Found using  handlebars" });
});
app.listen(3000);
