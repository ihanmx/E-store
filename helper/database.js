require("dotenv").config();
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

//the type to enable suggestion
/** @type {import('mongodb').Db} */

let _db;

const mongoConnect = (callback) => {
  //cb is func we pass to excute when the result ready
  MongoClient.connect(
    process.env.MONGO_URI, //db created automatically on first data insert even if db not was created manually
  )
    .then((client) => {
      console.log("Connected to MongoDB");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw new Error("No database found!");
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
