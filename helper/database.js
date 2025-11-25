const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "node-backend",
  password: "Han@Bz#3571",
});

module.exports = pool.promise();
