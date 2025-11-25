const Cart = require("./cart");
const db = require("../helper/database");

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
    //we are returning the promise
    return db.execute(
      "INSERT INTO products (title,price,imageUrl,description) VALUES(?,?,?,?) ",
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  static deleteById(id) {}

  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id) {
    return db.execute("SELECT * FROM products WHERE id = ?", [id]);
  }
};
