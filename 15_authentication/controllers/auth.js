const bcrypt = require("bcryptjs");

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
      req.session.save((error) => {
        console.log(error);
        res.redirect("/");
      });
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

exports.getSignup = (req, res, next) => {
  console.log("calling>>>>");
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    isAuthenticated: false,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect("/signup");
      }
      return bcrypt.hash(password, 12);
    })
    .then((hashedPass) => {
      const user = new User({
        email: email,
        password: hashedPass,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
