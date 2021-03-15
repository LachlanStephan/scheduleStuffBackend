const mysql = require("mysql");
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
// const getUsers = (res) => {
//   let sql = "SELECT * FROM Users";
//   pool.query(sql, (err, results) => {
//     if (!err) {
//       res.send(results);
//     } else {
//       res.status(400);
//     }
//   });
// };

////////////////////////////////////////////////////////////
// Func to retrieve schedule for users
////////////////////////////////////////////////////////////
const getSchedule = (userID, cb) => {
  // Select query
  let sql =
    "SELECT * FROM userEvent RIGHT JOIN Schedule ON userEvent.event_ID = Schedule.event_ID WHERE userEvent.users_ID = " +
    userID;
  pool.query(sql, (err, rows) => {
    // In case of error
    if (err) {
      cb(0);
    } else {
      // If correct ---> send rows in callback to the route
      cb(rows);
    }
  });
};

////////////////////////////////////////////////////////////
// Func to register user details
////////////////////////////////////////////////////////////
const regUser = (req, cb) => {
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

  // SQL to check if email is in use
  let check_user_sql = "SELECT * FROM USERS WHERE email = (?)";

  // Run email check query
  pool.query(check_user_sql, checkEmail, (err, rows) => {
    // In case of error
    if (err) {
      cb(0);
    }
    // check if the email already exists
    if (rows.length > 0) {
      cb(409);
    } else {
      // if new user ----> add new user
      pool.query(sql, [values], (err, rows) => {
        // Check for error
        if (err) {
          console.log(err);
        } else {
          // If correct ---> parse 201
          cb(201);
        }
      });
    }
  });
};

////////////////////////////////////////////////////////////
// Func to check the login
////////////////////////////////////////////////////////////
const login = (req, cb) => {
  // set login data
  let values = [req.body.email, req.body.password];
  let sql = "SELECT * FROM Users where email = ? AND password = ?";
  // run the query
  pool.query(sql, values, (err, rows) => {
    // In case of error
    if (err) {
      console.log(err);
    }
    // if the login does not exist
    if (rows.length === 0) {
      cb(0);
    }
    if (rows.length > 0) {
      // if everything is correct -----> send rows
      console.log(rows.users_ID);
      cb(rows[0].users_ID);
    }
  });
};

////////////////////////////////////////////////////////////
// Exports all func
////////////////////////////////////////////////////////////
module.exports = {
  getSchedule,
  regUser,
  login,
};
