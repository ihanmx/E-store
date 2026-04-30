const path = require("path");
const fs = require("fs");
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const User = require("./models/user");
const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname,
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
store.on("error", (err) => console.log("Session store error:", err));
app.set("view engine", "ejs");
app.set("views", "views");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
); //flags:'a' to append to the file instead of overwriting it

//middlewares
app.use(helmet()); //to set some security headers to protect our app from some common attacks like XSS, CSRF, etc.
app.use(compression()); //to compress the response body to reduce the size of the response and improve the performance of the app
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("combined", { stream: accessLogStream })); //to log the requests to the console in a nice format
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"),
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images"))); //to serve the images statically so we can access them in the frontend using the url stored in the database without having to create a route for each image
app.use(
  session({
    secret: "mySecret",
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);
app.use(flash());
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err); //better than concole.log(err) because it will be handled by the default error handling middleware in express and we can show a nice error page instead of crashing the app
    });
});
//routes
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;

  next();
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  //special error handling middleware in express that is called when we pass an error to next() or throw an error in any of the routes or middlewares
  res.status(error.httpStatusCode || 500).render("500", {
    pageTitle: "Error!",
    path: "/500",
  });
});

// new User({...}) only creates a JavaScript object in memory — it does not write anything to the database.

// .save() is what actually persists that document to MongoDB. Without it, the user would exist only in your application's memory and disappear as soon as the process ends.
app.use("/500", errorController.get500);
mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    console.log("server is running on port 3000");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
