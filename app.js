const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const User = require("./models/user");

const errorController = require("./controllers/error");
const mongoConnect = require("./helper/database").mongoConnect;

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  User.findById("698b0a2ebea10c542b30cd9c")
    .then((user) => {
      req.user = new User(user.username, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  if ((console.log("Connected to MongoDB"), app.listen(3000))); //this only called after successfil connection to mongo
});
