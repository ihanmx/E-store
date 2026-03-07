const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.NODEMAILER_KEY,
  },
});

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
    oldInputs: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInputs: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      //since we are redirected the redirect is treated as new req so to keep the err message accrosss req we need to store usign sessions through flash
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "login",
          errorMessage: "Invalid email or password",
          oldInputs: { email: email, password: password },
          validationErrors: [], //to mark both email and password as invalid in case of wrong email or password without having to check which one is wrong
        });
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
          } else {
            return res.status(422).render("auth/login", {
              path: "/login",
              pageTitle: "login",
              errorMessage: "Invalid email or password",
              oldInputs: { email: email, password: password },
              validationErrors: [], //to mark both email and password as invalid in case of wrong email or password without having to check which one is wrong
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
    oldInputs: {
      email: "",
      password: "",
      confirmPassword: "", //initial values
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req); //store errors from the check() validation in the route
  if (!errors.isEmpty()) {
    //422 is the status code for validation error
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign up",
      errorMessage: errors.array()[0].msg, //to get the first error message
      oldInputs: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(), //to keep the old inputs in the form after validation error
    });
  }
  //authentication if email exist is done in the route using custom() method of express validator and not here in the controller because we want to inject the error in the request and handle it in the same way as other validation errors without having to write extra code to handle it in the controller

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
      console.log("signup succeeded");
      res.redirect("/login");
      return transporter
        .sendMail({
          to: email,
          from: "hanan.bayazeed56@gmail.com",
          subject: "signup succeeded",
          html: " <h1>You Successfully signed up!</h1>",
        })
        .then((info) => console.log("mail sent:", info))
        .catch((err) => console.log("mail error:", err));
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        req.flash("error", "No account with that email found");
        return res.redirect("/reset");
      }
      const resetTokenExpiration = Date.now() + 3600000; //1hr
      user.resetToken = token;
      user.resetTokenExpiration = resetTokenExpiration;
      return user
        .save()
        .then((result) => {
          console.log(`http://localhost:3000/new-password/${token}`);
          res.redirect("/");
          transporter
            .sendMail({
              to: req.body.email,
              from: "hanan.bayazeed56@gmail.com",
              subject: "Password Reset",
              html: `<h1>You requested a password reset</h1>
          <p>Click this <a href="http://localhost:3000/new-password/${token}">link</a> to reset your password</p>`,
            })
            .then((info) => console.log("mail sent:", info))
            .catch((err) => console.log("mail error:", err));
        })
        .catch((err) => {
          console.log(err);
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  const token = req.params.token;

  //gt means greater than now
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid or expired token");
        return res.redirect("/login");
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid or expired token");
        return res.redirect("/login");
      }
      return bcrypt
        .hash(newPassword, 10)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
