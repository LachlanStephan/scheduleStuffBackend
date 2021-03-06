const mysql = require("mysql");
require("dotenv").config({ path: "./config/.env" });
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const { format } = require("date-fns");
const log = require("../logger/logger");

// DB connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});

// Func to retrieve schedule for users
const getSchedule = (userID, curDate, cb) => {
  console.log(curDate, "pre-format");
  let date = format(new Date(curDate), "yyyy-MM-dd");
  console.log(date, "post-format");
  // Select query
  let sql =
    "SELECT * FROM Schedule LEFT JOIN userEvent ON Schedule.event_ID = userEvent.event_ID  WHERE userEvent.users_ID = '" +
    userID +
    "' AND Schedule.startDate = '" +
    date +
    "' ORDER BY Schedule.startTime ASC";
  pool.query(sql, (err, rows) => {
    console.log(sql);
    console.log("Checksql1", rows, "after query");
    // In case of error
    if (err) {
      log.error(`query failed - getSchedule, sql: ${sql}, error: ${err}`);
      cb(400);
    }
    // If correct ---> send rows in callback to the route
    if (rows.length > 0) {
      cb(rows);
    } else {
      cb(204);
    }
  });
};

// Func to add a users schedule
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

  let friendID = req.body.friendID;

  pool.getConnection(function (err, connection) {
    connection.beginTransaction(function (err) {
      if (err) {
        log.error(`connection failed - addSchedule, error: ${err}`);
        throw err;
      } else {
        connection.query(sql, [values], (err, rows) => {
          if (err) {
            log.error(
              `query failed - addSchedule insert, sql: ${sql}, error: ${err}`
            );
            cb(0);
            return connection.rollback(function () {
              throw err;
            });
          } else {
            cb(201);
            console.log("check", rows, rows.insertId);
          }
          let eventID = rows.insertId;
          let userID = users_ID;
          let values2 = [userID, eventID];
          let sql2 = "INSERT INTO userEvent (users_ID, event_ID) VALUES (?)";
          connection.query(sql2, [values2], (err) => {
            if (err) {
              log.error(
                `query failed - addSchedule, insert to userEvent table, sql: ${sql}, error: ${err}`
              );
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
            log.error(`connection commit failed - addSchedule, error: ${err}`);
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

// Func to register user details
const regUser = (req, cb) => {
  // set form data that will be inserted
  console.log("check2");
  let password = req.body.password;
  bcrypt.genSalt(saltRounds, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      pass = hash;
      console.log(pass);

      let values = [req.body.fName, req.body.lName, req.body.email, pass];

      console.log(req.body.email);
      // SQL that will be used for insert to DB
      let sql = "INSERT INTO Users (fName, lName, email, password) VALUES (?)";

      // For the checking email exists query
      let checkEmail = req.body.email;

      // SQL to check if email is in use
      let check_user_sql = "SELECT * FROM Users WHERE email = (?)";

      // Run email check query
      pool.query(check_user_sql, checkEmail, (err, rows) => {
        // In case of error
        console.log(check_user_sql);
        if (err) {
          log.error(
            `query failed - regUser, check email exists, sql: ${sql}, error: ${err}`
          );
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
              log.error(
                `query failed, insert - regUser, sql ${sql}, error: ${err}`
              );
              console.log(err);
            } else {
              // If correct ---> parse 201
              cb(201);
            }
          });
        }
      });
    });
  });
};

// Func to check the login
const login = (req, cb) => {
  // set login data
  let email = req.body.email;
  let pass = req.body.password;
  let values = [email, pass];
  let sql = "SELECT * FROM Users WHERE email = ? ";
  pool.query(sql, email, (err, rows) => {
    if (err) {
      log.error(`query failed - login, sql: ${sql}, error: ${err}`);
      console.log(err);
      cb(400);
    }
    if (rows.length > 0) {
      bcrypt.compare(pass, rows[0].password, function (err, result) {
        if (result === true) {
          pool.query(sql, values, (err, rows) => {
            if (err) {
              log.error(`query failed - login, sql: ${sql}, error: ${err}`);
              cb(400);
              console.log(err);
            }
            if (rows.length > 0) {
              console.log(rows);
              cb(rows);
            }
          });
        } else {
          cb(0);
        }
      });
    } else {
      console.log("hi");
      cb(0);
    }
  });
};

// Update the users name
const updateName = (req, userID, cb) => {
  let value = req.body.newName;
  let sql = "UPDATE Users SET fName = (?) WHERE users_ID = " + userID;
  pool.query(sql, value, (err, rows) => {
    if (err) {
      log.error(`query failed - updateName, sql: ${sql}, error: ${err}`);
      console.log(err);
      cb(400);
    } else {
      cb(201);
    }
  });
};

// Get the users name
const getuserName = (userID, cb) => {
  let sql = "SELECT fName FROM Users WHERE users_ID = " + userID;
  pool.query(sql, (err, rows) => {
    if (err) {
      log.error(`query failed - getuserName, sql: ${sql}, ${err}`);
      console.log(err);
      cb(400);
    } else {
      cb(rows[0]);
    }
  });
};

// Get the users next event
const getUserEvent = (userID, cb) => {
  let sql =
    "SELECT eventName FROM Schedule INNER JOIN userEvent ON Schedule.event_ID = userEvent.event_ID WHERE userEvent.users_ID = " +
    userID +
    " ORDER BY Schedule.startDate, Schedule.startTime ASC";
  pool.query(sql, (err, rows) => {
    if (err) {
      log.error(`query failed - getUserEvent, sql: ${sql}, ${err}`);
      console.log(err);
      cb(400);
    }
    if (rows.length === 0) {
      cb(204);
    } else {
      cb(rows[0]);
    }
  });
};

// Delete a users event
// TODO - Add logging
const deleteUserEvent = (req, userID, cb) => {
  let eventID = req.body.event_ID;
  console.log(eventID);
  // Delete from userEvent table - query 1
  let sql =
    "DELETE FROM userEvent WHERE event_ID = " +
    eventID +
    " AND users_ID = " +
    userID;
  // Delete from schedule table - query 2
  let sql2 = "DELETE FROM schedule WHERE event_ID = " + eventID;
  pool.query(sql, (err) => {
    // Err
    if (err) {
      cb(400);
      console.log(err);
    } else {
      // If success call 2nd query
      pool.query(sql2, (err) => {
        if (err) {
          cb(400);
        } else {
          cb(204);
        }
      });
    }
  });
};

// Add friend
// TODO - Add logging
const addFriend = (fID, userID, cb) => {
  let values = [userID, fID];
  let sql = "INSERT INTO friends (user1_ID, user2_ID) VALUES (?)";
  pool.query(sql, [values], (err, rows) => {
    if (err) {
      cb(400);
      console.log(err);
    } else {
      cb(201);
    }
  });
};

// Check for friend req
// TODO - Add logging
const checkForFriend = (userID, cb) => {
  let sql =
    "SELECT fName FROM Users INNER JOIN friends ON Users.users_ID = friends.user1_ID WHERE user2_ID = " +
    userID +
    " AND status = 'Pending' ";
  pool.query(sql, (err, rows) => {
    if (err) {
      cb(400);
      console.log(err);
    }
    if (rows.length === 0) {
      cb(204);
    } else {
      cb(rows[0]);
      console.log(rows, "checkforfriendDBquery");
    }
  });
};

// Accept friend request
// TODO - Add logging
const acceptFriend = (userID, cb) => {
  let sql = "UPDATE friends SET status = 'accepted' WHERE user2_ID = " + userID;
  pool.query(sql, (err) => {
    if (err) {
      cb(400);
      console.log(err);
    } else {
      cb(200);
    }
  });
};

// Get friends list
// TODO - Add logging
const friendsList = (userID, cb) => {
  let sql =
    "SELECT fName FROM Users INNER JOIN friends ON Users.users_ID = friends.user1_ID WHERE status = 'accepted' AND user2_ID = " +
    userID;
  pool.query(sql, (err, rows) => {
    if (err) {
      cb(400);
      console.log(err);
    } else {
      cb(rows);
      console.log(rows, "friendsListQuertCheck");
    }
  });
};

// Need to finish - GET working
// TODO - Add logging
const addFriendToEvent = (req, cb) => {
  let values = [req.body.friendID, req.body.eventID];
  let sql = "INSERT into userEvent (users_ID, event_ID) VALUES (?)";
  pool.query(sql, [values], (err, rows) => {
    if (err) {
      cb(400);
    } else {
      cb(200);
    }
  });
};

// Get all users ****ADMIN
// TODO - Add logging
const getAllUsers = (cb) => {
  let sql = "SELECT users_ID, fName, lName, email, userType FROM Users";
  pool.query(sql, (err, rows) => {
    if (err) {
      cb(400);
    } else {
      cb(rows);
    }
  });
};

// Delete selected user ****ADMIN
// TODO - Add logging
const deleteUser = (delUserID, cb) => {
  console.log(delUserID, "db-layer");
  let sql = "DELETE FROM Users WHERE users_ID = " + delUserID;
  pool.query(sql, (err, rows) => {
    if (err) {
      cb(400);
      console.log(err);
    } else {
      cb(200);
    }
  });
};

// Get any orphaned events -> events with no users attached
// TODO - Add logging
const getEmptyEvents = (cb) => {
  console.log("emptyEvents - db");
  let sql = "SELECT * FROM userEvent WHERE users_ID IS NULL";
  pool.query(sql, (err, rows) => {
    if (err) {
      cb(400);
    }
    if (rows.length === 0) {
      cb(204);
    } else {
      cb(rows);
    }
  });
};

// Promote a user to Admin status -> **** Admin only
// TODO - Add logging
const promoteUser = (promoteUserID, cb) => {
  console.log("promoteUser db");
  let sql =
    "UPDATE Users SET userType = 'Admin' WHERE users_ID = " + promoteUserID;
  pool.query(sql, (err, rows) => {
    if (err) {
      cb(400);
    } else {
      cb(200);
    }
  });
};

// Exports all func
module.exports = {
  promoteUser,
  getEmptyEvents,
  deleteUser,
  getAllUsers,
  addFriendToEvent,
  friendsList,
  acceptFriend,
  checkForFriend,
  addFriend,
  deleteUserEvent,
  getUserEvent,
  getuserName,
  updateName,
  addSchedule,
  getSchedule,
  regUser,
  login,
};
