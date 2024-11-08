const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com", // SMTP server as shown in your image
//   port: 587, // Port for TLS
//   secure: false, // false for TLS (port 587); set to true if you use port 465 for SSL
//   auth: {
//     user: "7f9226001@smtp-brevo.com", // Login shown in the image
//     pass: "cdMVOBJjzDqL5mPZ", // Password shown in the image
//   },
// });

const transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com", // Mailjet SMTP host
  port: 587, // Use 587 for TLS
  secure: false, // Set to true for SSL
  auth: {
    user: "c74b6d55045c54988bb97bc2d3f21248", // Your Mailjet API Key
    pass: "6629bdb62182f8e7ffdd986d7ce786f2", // Your Mailjet API Secret
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
          const mailOptions = {
            from: "codewithsamiir@gmail.com",
            to: `${email}`,
            subject: "Signup successfully",
            html: "<p>You successfuly singned up using Mailjet !</p>",
          };
          return transporter.sendMail(mailOptions);
        })
        .catch((err) => {
          console.log("Eamil send error>>>", err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
