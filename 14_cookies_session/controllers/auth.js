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
  req.isLoggedIn = true;
  // res.setHeader("Set-Cookie", "isLoggedIn=true; HttpOnly");

  req.session.isLoggedIn = true;
  res.redirect("/");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((erro) => {
    console.log("logut error>>>", erro);
    res.redirect("/login");
  });
};
