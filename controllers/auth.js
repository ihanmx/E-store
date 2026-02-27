const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.get("Cookie"));
  res.render("auth/login", {
    path: "/login",
    pageTitle: "login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  User.findById("698dde62639ba11a38f94b5c")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = { _id: user._id.toString() };
      //async writing
      req.session.save((err) => {
        if (err) console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
