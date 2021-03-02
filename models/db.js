const mysql = require("mysql");
require("dotenv").config({ path: "./config/.env" });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});
connection.connect();

const getUsers = (res) => {
  connection.query("SELECT * FROM Users", (err, results) => {
    if (!err) {
      res.send(results);
    } else {
      res.status(400);
    }
  });
};

const getSchedule = (res) => {
  connection.query("SELECT * FROM Schedule", (err, results) => {
    if (!err) {
      res.send(results);
    } else {
      res.status(400);
    }
  });
};

const regUser = (res) => {
  let sql =
    "INSERT INTO Users (fName, email, password) VALUES ('fName', 'lName', 'email', 'password')";
  connection.query(sql, (err, rows) => {
    if (!err) {
      res.send(results);
    } else {
      res.status(400);
    }
  });
};

module.exports = {
  connection,
  getUsers,
  getSchedule,
  regUser,
};
