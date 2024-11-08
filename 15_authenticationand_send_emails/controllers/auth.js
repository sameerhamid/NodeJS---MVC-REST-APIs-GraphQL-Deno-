const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Brevo's SMTP server
  port: 587, // Use 587 for TLS or 465 for SSL
  secure: false, // Set to true if using port 465
  auth: {
    user: "7f9226001@smtp-brevo.com", // Your Brevo SMTP username
    pass: "cdMVOBljzDqL5mPZ", // Your Brevo SMTP password
  },
});

const User = require("../models/user");
exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get("Cookie").split("=")[1] === "true";

  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMsg: message,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  // res.setHeader("Set-Cookie", "isLoggedIn=true; HttpOnly");

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((error) => {
              console.log(error);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid password");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log("Error fetching user>>>", err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((erro) => {
    res.redirect("/login");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMsg: message,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash(
          "error",
          "Email already  exists, please pick a different one."
        );
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
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
          // const mailOptions = {
          //   from: '"Sameer" <codewithsamiir@gmail.com',
          //   to: `${email}`,
          //   subject: "Signup successfully",
          //   html: "<p>You successfuly singned up!</p>",
          // };
          // return transporter.sendMail(mailOptions);
        });
      // .catch((err) => {
      //   console.log("Eamil send error>>>", err);
      // });
    })
    .catch((err) => {
      console.log(err);
    });
};
