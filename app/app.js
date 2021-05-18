const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const dbFunc = require("../model/db");
const apiFunc = require("../api/api");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const log = require("../logger/logger");
const { json } = require("express");
const server = require("http").createServer(app);

// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true,
//   },
// });

//////////////////////////////////////////
// Notes to self
//////////////////////////////////////////

// To set sessions
app.use(cookieParser());
// app.set("trust proxy", 1);
app.use(
  session({
    name: "scheduleStuffCookie",
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: "/",
      sameSite: "lax",
    },
  })
);

// Handle cors
// originWhitelist = [
//   "http://localhost:3000",
//   "https://schedule-stuff.vercel.app",
// ];
app.use(
  cors({
    // Only accept req from scheduleStuff client
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// To rate limit the API from spam/bots
const dailyLimiter = rateLimit({
  windowMs: 1000 * 60 * 60 * 24,
  max: 3000, // limit each IP to 1000 requests per day
});

const userLimiter = rateLimit({
  windowMs: 1000,
  max: 10, // limit each user to 10 req per sec --> **** 1 is not enough ****
});

app.use(dailyLimiter, userLimiter);

// To parse json data
let jsonParser = bodyParser.json();

// io.on("connection", (socket) => {
//   socket.send("hello");
// });

app.get("/", (req, res) => {
  res.send("hello!");
});

// Retrieve schedule for user
app.get("/schedule/:curDate", (req, res) => {
  // Log the route has been accessed
  // Assign the user ID
  let users_ID = req.session.users_ID;
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  // Assign the date for the DB func
  let curDate = req.params.curDate;
  console.log(users_ID, curDate);
  // Parse userID to query && date
  dbFunc.getSchedule(users_ID, curDate, (rows) => {
    if (users_ID === null) {
      res.status(401).send();
    }
    if (rows === 400) {
      res.status(400).send();
    }
    // Connected but no content
    if (rows === 204) {
      res.status(204).send();
    } else {
      log.info(
        `User successfully retrieved schedule, userType: ${type}, ip address: ${ip}`
      );
      // If correct ---> send rows(schedule)
      res.status(200).send(rows);
      console.log("success");
    }
  });
});

// Post user schedule && call function to validate input
app.post("/addSchedule", jsonParser, apiFunc.valaddSchedule(), (req, res) => {
  console.log(req.body);
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  // Assign userID
  let users_ID = req.session.users_ID;
  console.log(users_ID);
  // Call the fucntion to check for errors and return callback
  apiFunc.valErrors(req, (cb) => {
    // If input is invalid
    if (cb === 422) {
      log.info(
        `failed to vailidate - addSchedule, userType: ${type}, ip address: ${ip}`
      );
      res.status(422).send();
    }
    // If input is valid --> continue to db function
    if (cb === 200) {
      dbFunc.addSchedule(req, users_ID, (cb) => {
        if (cb === 0) {
          res.status(400).send();
        }
        if (cb === 201) {
          log.info(`successfully inserted schedule", userType: ${type}`);
          res.status(201).send();
        }
      });
    }
  });
});

// Post register details && call function to validate input
app.post("/regUser", jsonParser, apiFunc.valReg(), (req, res) => {
  console.log("got body", req.body);
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  // Call the fucntion to check for errors and return callback
  apiFunc.valErrors(req, (cb) => {
    // If input is invalid
    if (cb === 422) {
      log.error(
        `failed to validate - register, userType: ${type}, ip address: ${ip}`
      );
      res.status(422).send();
    }
    // If input is valid --> continue to db function
    if (cb === 200) {
      dbFunc.regUser(req, (userCheck) => {
        console.log(req.body.password);
        if (userCheck === 0) {
          console.log("failed");
        }
        // If email exists send 409
        if (userCheck === 409) {
          res.status(409).send();
        }
        // If correct ---> send 201
        if (userCheck === 201) {
          log.info("Successful registration");
          res.status(201).send("new user added");
          // req.session.isLoggedin = true;
          // req.session.users_ID = users_ID;
          console.log("success");
        } else {
          console.log("error");
        }
      });
    }
  });
});

// Handle the login
app.post("/login", jsonParser, apiFunc.valLog(), (req, res) => {
  console.log("got body", req.body);
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  log.info(`App visited, userType: ${type}, ip address: ${ip}`);
  apiFunc.valErrors(req, (cb) => {
    if (cb === 422) {
      log.info(
        `Failed validation - login, userType: ${type}, ip address: ${ip} `
      );
      res.status(422).send();
    }
    if (cb === 200) {
      dbFunc.login(req, (rows) => {
        // Check if this is a valid userID
        if (rows === 0) {
          res.status(401).send("this login does not exist");
        } else {
          // If valid ----> set session and 200 ok
          req.session.isLoggedin = true;
          req.session.users_ID = rows[0].users_ID;
          req.session.userType = rows[0].userType;
          res.status(200).send("session set and user logged in");
          console.log("success", req.session.users_ID, req.session.userType);
          log.info(`Successful login, userType: ${type}, ip address: ${ip}`);
        }
      });
    }
  });
});

// Allow users to logout
app.post("/logout", (req, res) => {
  console.log("check1");
  req.session.destroy(function (err) {
    if (err) {
      res.status(400).send();
      console.log("fail");
    } else {
      res.status(200).send();
      console.log("logout");
    }
  });
});

// Update the users name
app.patch("/updateName", jsonParser, apiFunc.valUpdateName(), (req, res) => {
  console.log("got body", req.body);
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  // Assign userID and parse to DB func
  let userID = req.session.users_ID;
  apiFunc.valErrors(req, (cb) => {
    // If validation fails
    if (cb === 422) {
      log.info(
        `Failed validation - updateName, userType: ${type}, ip address ${ip}`
      );
      res.status(422).send();
    }
    // If validation is successful
    if (cb === 200) {
      // Call DB func
      dbFunc.updateName(req, userID, (cb) => {
        if (cb === 400) {
          res.status(400).send();
        }
        if (cb === 201) {
          log.info(
            `Success - update name, userType: ${type}, ip address: ${ip}`
          );
          res.status(201).send();
        }
      });
    }
  });
});

// Fetch user name
app.get("/getUserName", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  dbFunc.getuserName(userID, (rows) => {
    if (rows === 400) {
      res.status(400).send();
    } else {
      console.log(rows);
      res.status(200).send(rows);
      log.info(`success - get name, userType: ${type}, ip address: ${ip}`);
    }
  });
});

// Fetch next user event
app.get("/getUserEvent", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  dbFunc.getUserEvent(userID, (rows) => {
    console.log(rows, "getEvent**********");
    if (rows === 400) {
      res.status(400).send();
    }
    if (rows === 204) {
      res.status(204).send();
    } else {
      res.status(200).send(rows);
      log.info(
        `success - get next event, userType: ${type}, ip address: ${ip}`
      );
    }
  });
});

// Delete user events
app.post("/deleteEvent", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  console.log(req.body.event_ID);
  // Call db function
  dbFunc.deleteUserEvent(req, userID, (cb) => {
    // If err
    if (cb === 400) {
      res.status(400).send();
    }
    // If successfully deleted
    if (cb === 204) {
      res.status(204).send();
      log.info(
        `success - delete user event, userType: ${type}, ip address: ${ip}`
      );
    }
  });
});

// Get a users ID
// TODO - Add logging
app.get("/getID", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  // send userID
  if ((userID = req.session.users_ID)) {
    res.status(200).json(userID);
    console.log(userID);
  } else {
    res.status(400).send();
  }
});

// Add friend
// Need to add validation && logging
app.post("/addFriend", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  console.log(req.body[0], "addFriend req check");
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  let fID = parseInt(req.body[0]);
  // call db func
  dbFunc.addFriend(fID, userID, (cb) => {
    if (cb === 400) {
      res.status(400).send();
    } else {
      res.status(200).send();
    }
  });
});

// Check for friend requests
// Need to add validation && logging
app.get("/checkFriend", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  console.log("checkFriend route check");
  // call db func
  dbFunc.checkForFriend(userID, (rows) => {
    if (rows === 400) {
      res.status(400).send();
    }
    if (rows === rows) {
      res.status(200).send(rows);
      console.log(rows);
    }
  });
});

// Accept friend requests
// Need to add validation && logging
app.patch("/acceptFriend", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  dbFunc.acceptFriend(userID, (cb) => {
    if (cb === 400) {
      res.status(400).send();
    }
    if (cb === 200) {
      res.status(200).send();
    }
  });
});

// Get friends list
// TODO - Add logging
app.get("/friendsList", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  dbFunc.friendsList(userID, (rows) => {
    if (rows === 400) {
      res.status(400).send();
    }
    if (rows === rows) {
      res.status(200).send(rows);
    }
  });
});

// Add frient to event
// TODO - Add logging && get this working
app.post("/addFriendToEvent", jsonParser, (req, res) => {
  // Assign ip && userType for logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  console.log(req);
  dbFunc.addFriendToEvent(req, (cb) => {
    if (cb === 400) {
      res.status(400).send();
    }
    if (cb === 200) {
      res.status(200).send();
    }
  });
});

// Check if user is logged in - restricts access if not
// TODO - Add logging
app.get("/checkLogin", jsonParser, (req, res) => {
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  console.log(userID, "checkLogin route");
  if (!userID) {
    res.status(403).send();
  } else {
    res.status(200).send();
  }
});

// Check if user is Admin via userType and IP address
// TODO - Add logging
app.get("/checkAdmin", jsonParser, (req, res) => {
  // TODO - This needs to be moved to a new table in DB -> new ip's added via admin panel
  let whitelist = ["202.0.188.100", "::1", "::ffff:127.0.0.1"];
  // For logging
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  console.log(type, "checkAdmin");
  if (type === "Admin") {
    for (let i = 0; i < whitelist.length; i++) {
      console.log(ip);
      if (ip === whitelist[i]) {
        console.log(whitelist[i], "whitelist IP");
        res.status(201).send();
      } else {
        res.status(403).send();
      }
    }
  }
  if (type === "user") {
    res.status(403).send();
  }
});

// Get all users ****ADMIN
// TODO - Add logging
app.get("/getAllUsers", jsonParser, (req, res) => {
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  console.log("get all users");
  dbFunc.getAllUsers((rows) => {
    if (rows === 400) {
      res.status(400).send();
    }
    if (rows === rows) {
      res.status(200).send(rows);
    }
  });
});

// Delete users ****ADMIN
// TODO Logging and validation
app.post("/deleteUser", jsonParser, (req, res) => {
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  console.log(req.body.users_ID, "delete user route");
  let delUserID = req.body.users_ID;
  dbFunc.deleteUser(delUserID, (cb) => {
    if (cb === 400) {
      res.status(400).send();
    } else {
      res.status(200).send();
    }
  });
});

// TODO add logging
app.get("/emptyEvents", jsonParser, (req, res) => {
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  console.log("emptyEvents route");
  dbFunc.getEmptyEvents((rows) => {
    if (rows === 400) {
      res.status(400).send();
    }
    if (rows === 204) {
      res.status(204).send();
    }
    if (rows === 200) {
      res.status(200).send(rows);
    }
  });
});

// TODO Logging anf validation
app.patch("/promoteUser", jsonParser, (req, res) => {
  let ip = req.ip;
  let type = req.session.userType;
  let userID = req.session.users_ID;
  let promoteUserID = req.body.users_ID;
  console.log("promoteUser route");
  dbFunc.promoteUser(promoteUserID, (cb) => {
    if (cb === 400) {
      res.status(400).send();
    }
    if (cb === 200) {
      res.status(200).send();
    }
  });
});

module.exports = server;
