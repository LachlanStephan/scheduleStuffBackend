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
// Func to retrieve schedule for users
////////////////////////////////////////////////////////////
const getSchedule = (userID, cb) => {
  // Select query
  let sql =
    "SELECT * FROM userEvent INNER JOIN Schedule ON userEvent.event_ID = Schedule.event_ID WHERE userEvent.users_ID = " +
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
// Func to add a users schedule
////////////////////////////////////////////////////////////
const addSchedule = (req, users_ID, cb) => {
  let values = [
    req.body.startDate,
    req.body.endDate,
    req.body.startTime,
    req.body.endTime,
    req.body.eventTitle,
    req.body.eventDesc,
  ];
  let sql =
    "INSERT INTO Schedule (startDate, endDate, startTime, endTime, eventName, eventDescription) values (?)";

  pool.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      } else {
        connection.query(sql, [values], (err, rows) => {
          if (err) {
            cb(0);
            return connection.rollback(function () {
              throw err;
            });
          } else {
            cb(201);
            console.log("check", rows, rows.insertId); // Coming back undefined --> need this to work for 2nd part of transaction
          }
          let eventID = rows.insertId;
          let userID = users_ID;
          let values2 = [userID, eventID];
          let sql2 = "INSERT INTO userEvent (users_ID, event_ID) VALUES (?)";
          connection.query(sql2, [values2], (err) => {
            if (err) {
              cb(0);
              return connection.rollback(function () {
                throw err;
              });
            } else {
              cb(201);
            }
          });
        });
        connection.commit(function (err) {
          if (err) {
            return connection.rollback(function () {
              throw err;
            });
          }
          console.log("success");
        });
      }
    });
  });
};

// pool.query("", (err, rows) => {
//   if (err) {
//     console.log(err, rows);
//   }
//   if (rows.startTime.length > 0 && rows.startDate.length > 0) {
//     cb(409);
//   } else {
//     pool.query(sql, [values], (err, rows) => {
//       if (err) {
//         console.log(err);
//       } else {
//         cb(201);
//       }
//     });
//   }
// });

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
  console.log("check2");

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
// Update the users name
////////////////////////////////////////////////////////////
const updateName = (req, userID, cb) => {
  let value = req.body.newName;
  let sql = "UPDATE Users SET fName = (?) WHERE users_ID = " + userID;
  pool.query(sql, value, (err, rows) => {
    if (err) {
      console.log(err);
      cb(400);
    } else {
      cb(201);
    }
  });
};

////////////////////////////////////////////////////////////
// Exports all func
////////////////////////////////////////////////////////////
module.exports = {
  updateName,
  addSchedule,
  getSchedule,
  regUser,
  login,
};
