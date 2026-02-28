const path = require("path");
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
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});
store.on("error", (err) => console.log("Session store error:", err));
app.set("view engine", "ejs");
app.set("views", "views");

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
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
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
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

// new User({...}) only creates a JavaScript object in memory — it does not write anything to the database.

// .save() is what actually persists that document to MongoDB. Without it, the user would exist only in your application's memory and disappear as soon as the process ends.

mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    console.log("server is running on port 3000");
    app.listen(3000);
  })
  .catch((err) => console.log(err));
