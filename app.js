const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const sequelize = require("./helper/database");

const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const Order = require("./models/order");
const CartItem = require("./models/cart-item");
const OrderItem = require("./models/order-item");


const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

//add a middleware to get the user
app.use((req,res,next)=>{
  User.findByPk(1).then((user)=>{
    req.user=user; //we can attach any thing to req object and it will be available in the next middlewares since we are not override existed properties

    //the user is not normal obj it is a sequelize obj so we can use its methods
    next();
  }).catch((err)=>{
    console.log(err);
  });
  // next();
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
//relations 
Product.belongsTo(User,{constraints:true,onDelete:'CASCADE'}); //on delete means that when we delete the user it would delete related products
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product,{through:CartItem});
Product.belongsToMany(Cart,{through:CartItem});//through is the junction table 3dh table that connect both and it is not optional
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product,{through:OrderItem});
 Product.belongsToMany(Order,{through:OrderItem});




//{ alter: true } to update tables without dropping them
//{force:true} to drop and recreate tables not used in production mode
sequelize.sync().then((result) => {
 return User.findByPk(1).then((user)=>{
  if(!user){
    return User.create({name:"Max",email:"test@test.com"})}

    return user}).then((user)=>{  //because if user .create is executed it returns a promise we need to handle it
      console.log(user);
      return user.createCart(); //create cart for the user if not exists
   
    }).then(()=>{
      app.listen(3000);
    });
  // app.listen(3000);
}).catch((err)=>{
  console.log(err);
});


