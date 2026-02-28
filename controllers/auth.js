const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log(req.get("Cookie"));
  res.render("auth/login", {
    path: "/login",
    pageTitle: "login",
    errorMessage: message, //to retrive the eeror if exists from postLogin after redirect
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      //since we are redirected the redirect is treated as new req so to keep the err message accrosss req we need to store usign sessions through flash
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = { _id: user._id.toString() };
            //async writing
            req.session.save((err) => {
              if (err) console.log(err);
              res.redirect("/");
            });
          }
        })
        .catch((err) => {
          console.log(err);
          req.flash("error", "Invalid email or password");
          return res.redirect("/login");
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

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign up",
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "Email exists already, please pick a different one");
        return res.redirect("/signup");
      } else {
        return bcrypt
          .hash(password, 10)
          .then((hashedpassword) => {
            const user = new User({
              email: email,
              password: hashedpassword,
              cart: { items: [] },
            });
            return user.save();
          })
          .then((result) => {
            return res.redirect("/login");
          });
      }
    })

    .catch((err) => {
      console.error(err);
    });
};
