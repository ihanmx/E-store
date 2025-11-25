//notice the name of the file is product not products it is the core entity
const fs = require("fs");
const path = require("path");
const rootDir = require("../helper/path");
const p = path.join(rootDir, "data", "products.json"); //the path of data file

const Cart = require("./cart");

const getProductsFromFile = (callback) => {
  //static mean on class level so it retrives all products not one
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      callback([]);
    }
    callback(JSON.parse(fileContent));
  });
};
module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
  //we can use this function to add/edit the products
  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        //check if the product exists so only I should update it
        const existedProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existedProductIndex] = this; //this is the product class currently we reffer to it
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });
      } else {
        //if no id existed it is new product so initiate id

        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => {
        return prod.id === id;
      });
      const updatedProducts = products.filter((p) => {
        return p.id !== id;
      });

      fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  static fetchAll(callback) {
    getProductsFromFile(callback);
  }

  static findbyId(id, callback) {
    getProductsFromFile((products) => {
      const product = products.find((p) => {
        return p.id === id;
      });
      callback(product);
    });
  }
};
