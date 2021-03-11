const mysql = require("mysql");
const { request, rawListeners } = require("../server");
require("dotenv").config({ path: "./config/.env" });
////////////////////////////////////////////////////////////
// DB connection
////////////////////////////////////////////////////////////
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

////////////////////////////////////////////////////////////
// Test func for * users
////////////////////////////////////////////////////////////
const getUsers = (res) => {
  let sql = "SELECT * FROM Users";
  pool.query(sql, (err, results) => {
    if (!err) {
      res.send(results);
    } else {
      res.status(400);
    }
  });
};
////////////////////////////////////////////////////////////
// Func to retrieve schedule for users
////////////////////////////////////////////////////////////
const getSchedule = (req, res) => {
  let sql = "SELECT * FROM Schedule";
  pool.query(sql, (err, rows) => {
    if (!err) {
      res.status(201).send(rows);
    } else {
      res.send(204);
    }
  });
};

////////////////////////////////////////////////////////////
// Func to register user details
////////////////////////////////////////////////////////////
const regUser = (req, res) => {
  // set form data that will be inserted
  let values = [
    req.body.fName,
    req.body.lName,
    req.body.email,
    req.body.password,
  ];

  // SQL that will be used for insert to DB
  let sql = "INSERT INTO Users (fName, lName, email, password) VALUES (?)";

  // For checking the email exists query
  let checkEmail = req.body.email;

  // Checks if email is in use
  let check_user_sql = "SELECT * FROM USERS WHERE email = (?)";

  // Query to check the email (exists or not)
  pool.query(check_user_sql, checkEmail, (err, rows) => {
    if (err) {
      console.log(err);
      res.status(400).send();
    }
    if (rows.length > 0) {
      console.log("email in use");
      res.status(403).send();
      pool.release;
    } else {
      // if new user ----> add new user
      pool.query(sql, [values], (err, rows) => {
        if (err) {
          res.status(400).send();
          console.log(err);
        } else {
          console.log("success");
          res.status(201).send();
        }
      });
    }
  });
};

////////////////////////////////////////////////////////////
// Func to check the login
////////////////////////////////////////////////////////////
const login = (req, res) => {
  // set login data
  let values = [req.body.email, req.body.password];
  let sql = "SELECT * FROM Users where email = ? AND password = ?";
  // run the query
  pool.query(sql, [values], (err, rows) => {
    if (rows.length > 0) {
      // set id and isloggedin boolean in session
      req.session.isloggedin = true;
      req.session.userID = userID;
      res.statusCode(200);
    } else {
      res.statusCode(401);
    }
  });
};

////////////////////////////////////////////////////////////
// Exports all func
////////////////////////////////////////////////////////////
module.exports = {
  getUsers,
  getSchedule,
  regUser,
  login,
};
