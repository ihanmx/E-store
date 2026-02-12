const mongodb = require("mongodb");
const getDb = require("../helper/database").getDb;

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = { items: (cart && cart.items) || [] }; //{items:[]}
    this._id = id;
  }
  save() {
    const db = getDb();

    return db
      .collection("users")
      .insertOne(this)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  addToCart(product) {
    const db = getDb();
    const cartItems = [...this.cart.items];

    const existingIndex = cartItems.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });

    if (existingIndex >= 0) {
      cartItems[existingIndex].quantity += 1;
    } else {
      cartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: 1,
      });
    }

    const updatedCart = { items: cartItems };

    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: updatedCart } },
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => {
      return i.productId;
    });

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          //merging clllection to get data
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString(); //we added the quantity because it is not stored in the prod collection
            }).quantity, //extract quantity
          };
        });
      })
      .catch((err) => {
        console.log(err);
      }); //in returns list of prods with ids mentioned
  }

  deleteItemFromCart(productId) {
    const updatedCartItem = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItem } } },
      );
  }

  addOrder() {
    const db = getDb();

    return this.getCart()
      .then((products) => {
        const order = {
          items: products, //full prods info to display order and no worry about updated proces
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.username,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        //empty the cart
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: [] } } },
          );
      });
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new mongodb.ObjectId(this._id) })
      .toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) });
  }
}

module.exports = User;
