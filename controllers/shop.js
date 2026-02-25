const Product = require("../models/product");
const Order = require("../models/order");
const product = require("../models/product");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      //rows stands for resault[0]
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId) //findBy Id provided by mongoose and it converts ids to mongoo obj id automatically
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      //rows stands for resault[0]
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")

    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
  // let fetchedCart; //to hold the cart of the user
  // let newQuantity = 1; //initial quantity

  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart; //store cart
  //     return cart.getProducts({ where: { id: productId } }); //get products in the cart that match the product id
  //   })
  //   .then((products) => {
  //     let product;
  //     ////////found product in the cart////////

  //     if (products.length > 0) {
  //       product = products[0];
  //     }
  //     //increase quantity if found
  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }

  //     /////////not found product in the cart////////

  //     return Product.findByPk(productId); // if the product not found in the cart then get it from products table
  //   })
  //   .then((product) => {
  //     //add the product to the cart
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity }, //set the quantity in the junction table to 1
  //     });
  //   })
  //   .then(() => {
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

//   Product.findbyId(productId, (product) => {
//     Cart.addProduct(productId, product.price);
//   });
//   res.redirect("/cart");
// };

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  req.user
    .removeFromCart(productId)

    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postOrder = (req, res, next) => {
  return req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      return order
        .save()
        .then(() => {
          return req.user.clearCart();
        })
        .then(() => {
          res.redirect("/orders");
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
