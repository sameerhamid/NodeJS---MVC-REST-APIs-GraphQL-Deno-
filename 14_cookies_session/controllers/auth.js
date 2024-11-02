exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.get("Cookie").split("=")[1] === "true";
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  //   const { email, password } = req.body;
  req.isLoggedIn = true;
  res.setHeader("Set-Cookie", "isLoggedIn=true; HttpOnly");
  res.redirect("/");
};
