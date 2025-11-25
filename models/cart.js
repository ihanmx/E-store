const path = require("path");
const fs = require("fs");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  //only satatic method so I am not creating a new cart
  static addProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      //in case we don't have cart
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        //there is content in file
        cart = JSON.parse(fileContent);
      }

      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      ); //check if the product we trying to add existed
      let existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.quantity = updatedProduct.quantity + 1; //we increse the quantity if the product exist
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, quantity: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      //to increase total price in the cart when we add a product
      cart.totalPrice = cart.totalPrice + +productPrice; //+to convert string to number
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }

      const updatedCart = { ...JSON.parse(fileContent) };

      const product = updatedCart.products.find((product) => product.id === id);

      // If product doesn't exist, do nothing
      if (!product) {
        return;
      }

      const productQuantity = product.quantity;

      updatedCart.products = updatedCart.products.filter(
        (product) => product.id !== id
      );

      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * productQuantity;

      // ✅ writeFile MUST be inside callback
      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(callback) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        callback(null);
      }

      callback(cart);
    });
  }
};
