const bcrypt = require("bcryptjs");

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

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
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMsg: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }

  // res.setHeader("Set-Cookie", "isLoggedIn=true; HttpOnly");

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMsg: "Invalid email",
          oldInput: {
            email,
            password,
          },
          validationErrors: [{ path: "email" }],
        });
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
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            errorMsg: "Invalid Password",
            oldInput: {
              email,
              password,
            },
            validationErrors: [{ path: "password" }],
          });
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
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMsg: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  // User.findOne({ email: email })
  //   .then((userDoc) => {
  //     if (userDoc) {
  //       req.flash(
  //         "error",
  //         "Email already  exists, please pick a different one."
  //       );
  //       return res.redirect("/signup");
  //     }
  // return
  bcrypt
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
    })
    // })
    .catch((err) => {
      console.log(err);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMsg: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("Error while create random bytes>>>>", err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with this email exists.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        const mailOptions = {
          from: "codewithsamiir@gmail.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `<p>
          You requested a password reset
          </p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set new password</p>
          `,
        };
        transporter.sendMail(mailOptions);
      })
      .catch((err) => {
        console.log("Error while finding user>>>", err);
        return res.redirect("/reset");
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        pageTitle: "New Password",
        path: "/new-password",
        errorMsg: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((error) => {
      console.log("Error while finding user>>>", error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { userId, password, confirmPassword, passwordToken } = req.body;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "No user found.");
        return res.redirect("/reset");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPass) => {
          user.password = hashedPass;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        })
        .catch((err) => {
          console.log("Error while updating password>>>", err);
        });
    })
    .catch((error) => {
      console.log("Error while finding user>>>", error);
    });
};
