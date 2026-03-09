const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { query } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ITEMS_PER_PAGE = 3;

exports.getProducts = (req, res, next) => {
  const page = req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      //rows stands for resault[0]
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        totalProducts: totalItems,
        currentPage: parseInt(page),
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: parseInt(page) + 1,
        previousPage: parseInt(page) - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      //rows stands for resault[0]
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        totalProducts: totalItems,
        currentPage: parseInt(page),
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: parseInt(page) + 1,
        previousPage: parseInt(page) - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  User.findById(req.session.user._id)
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      return User.findById(req.session.user._id).then((user) =>
        user.addToCart(product),
      );
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  User.findById(req.session.user._id)
    .then((user) => user.removeFromCart(productId))
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.postOrder = (req, res, next) => {
//   User.findById(req.session.user._id)
//     .populate("cart.items.productId")
//     .then((user) => {
//       const products = user.cart.items.map((i) => {
//         return { quantity: i.quantity, product: { ...i.productId._doc } };
//       });
//       const order = new Order({
//         user: {
//           email: user.email,
//           userId: user,
//         },
//         products: products,
//       });
//       return order
//         .save()
//         .then(() => {
//           return user.clearCart();
//         })
//         .then(() => {
//           res.redirect("/orders");
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// };

exports.getCheckout = (req, res, next) => {
  User.findById(req.session.user._id)
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;
      const totalSum = products.reduce((sum, p) => {
        return sum + p.quantity * p.productId.price;
      }, 0);
      return stripe.checkout.sessions
        .create({
          payment_method_types: ["card"],
          mode: "payment",
          line_items: products.map((p) => ({
            price_data: {
              currency: "usd",
              product_data: { name: p.productId.title },
              unit_amount: Math.round(p.productId.price * 100), // cents
            },
            quantity: p.quantity,
          })),
          success_url:
            req.protocol + "://" + req.get("host") + "/checkout/success",
          cancel_url:
            req.protocol + "://" + req.get("host") + "/checkout/cancel",
        })
        .then((session) => {
          res.render("shop/checkout", {
            path: "/checkout",
            pageTitle: "Checkout",
            products: products,
            totalSum: totalSum,
            stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
            sessionId: session.id,
          });
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.session.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceName = "Invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath)); //to save the pdf in the server
      pdfDoc.pipe(res); //to send the pdf to the client
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "content-disposition",
        'insline;filename="' + invoiceName + '"',
      );
      pdfDoc.fontSize(26).text("Invoice", { underline: true });
      pdfDoc.text("--------------------------------------------------");

      order.products.forEach((prod) => {
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price,
          );
      });
      pdfDoc.text("--------------------------------------------------");
      pdfDoc.fontSize(20).text(
        "Total Price: $" +
          order.products.reduce((total, prod) => {
            return total + prod.quantity * prod.product.price;
          }, 0),
      );
      pdfDoc.end();
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // fs.readFile(invoicePath, (err, data) => {
  //   if (err) {
  //     console.log(err);
  //     return next(err);
  //   } else {
  //     res.setHeader("Content-Type", "application/pdf");
  //     res.setHeader(
  //       "content-disposition",
  //       'insline;filename="' + invoiceName + '"',
  //     );
  //     //control the name of pdf + the inline to open it in the browser instead of downloading it
  //     res.send(data);
  //   }
  // });
  // const file = fs.createReadStream(invoicePath);
  // res.setHeader("Content-Type", "application/pdf");
  // res.setHeader(
  //   "content-disposition",
  //   'insline;filename="' + invoiceName + '"',
  // );
  // file.pipe(res);
};

exports.getCheckoutSuccess = (req, res, next) => {
  User.findById(req.session.user._id)
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: { email: user.email, userId: user },
        products: products,
      });
      return order
        .save()
        .then(() => user.clearCart())
        .then(() => res.redirect("/orders"));
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
