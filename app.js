const path = require("path");
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const User = require("./models/user");

const errorController = require("./controllers/error");

const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use((req, res, next) => {
  User.findById("698dde62639ba11a38f94b5c")
    .then((user) => {
      req.user = new User(user);
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

// new User({...}) only creates a JavaScript object in memory — it does not write anything to the database.

// .save() is what actually persists that document to MongoDB. Without it, the user would exist only in your application's memory and disappear as soon as the process ends.

mongoose
  .connect(process.env.MONGO_URI)
  .then(async (result) => {
    console.log("server is running on port 3000");
    User.find().then((users) => {
      if (users.length === 0) {
        //because find always return array even if empty
        const user = new User({
          name: "Hanan",
          email: "hanan@test.com",
          cart: { items: [] },
        });
        user.save();
      }
    });

    app.listen(3000);
  })
  .catch((err) => console.log(err));
