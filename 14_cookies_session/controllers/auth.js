const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get("Cookie").split("=")[1] === "true";
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.session?.isLoggedIn ?? false,
  });
};

exports.postLogin = (req, res, next) => {
  //   const { email, password } = req.body;

  // res.setHeader("Set-Cookie", "isLoggedIn=true; HttpOnly");

  User.findById("6722e97b09afbe1bfae25f55")
    .then((user) => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      res.redirect("/");
      next();
    })
    .catch((err) => {
      console.log("Error fetching user>>>", err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((erro) => {
    console.log("logut error>>>", erro);
    res.redirect("/login");
  });
};
