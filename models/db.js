const mysql = require("mysql");
require("dotenv").config({ path: "./config/.env" });

// DB connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});
connection.connect();

// Test func for * users
const getUsers = (res) => {
  connection.query("SELECT * FROM Users", (err, results) => {
    if (!err) {
      res.send(results);
    } else {
      res.status(400);
    }
  });
};

// Func to retrieve schedule for users
const getSchedule = (res) => {
  connection.query("SELECT * FROM Schedule", (err, results) => {
    if (!err) {
      res.send(results);
    } else {
      res.status(400);
    }
  });
};

// Func to register user details
const regUser = (req, res) => {
  // set form data
  let values = [
    req.body.fName,
    req.body.lName,
    req.body.email,
    req.body.password,
  ];
  // insert reg details to DB
  connection.query(
    "INSERT INTO Users (fName, lName, email, password) VALUES (?, ?, ?, ?)",
    values,
    (err, rows) => {
      if (err) {
        console.log(err);
      } else {
        console.log(rows);
      }
    }
  );
};

// Exports all func
module.exports = {
  connection,
  getUsers,
  getSchedule,
  regUser,
};
