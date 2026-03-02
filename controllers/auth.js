const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
          });
      }
    })

    .catch((err) => {
      console.error(err);
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
    });
};
