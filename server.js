const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const nodemon = require("nodemon");
const bodyParser = require("body-parser");
const dbFunc = require("./model/db");
const apiFunc = require("./api/api");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const log = require("./logger/logger");

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
    },
  })
);

// Handle cors
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

app.use(dailyLimiter);

// To parse json data
let jsonParser = bodyParser.json();

// Retrieve schedule for user
app.get("/schedule/:curDate", (req, res) => {
  // Log the route has been accessed
  // Assign the user ID
  let users_ID = req.session.users_ID;
  let curDate = req.params.curDate;
  console.log(users_ID, curDate);
  // Parse userID to query && date
  dbFunc.getSchedule(users_ID, curDate, (rows) => {
    if ((users_ID = null)) {
      res.status(401).send();
    }
    // Connected but no content
    if (rows === 204) {
      res.status(204).send();
    } else {
      // If correct ---> send rows(schedule)
      res.status(200).send(rows);
      console.log("success");
    }
  });
});

// Post user schedule && call function to validate input
app.post("/addSchedule", jsonParser, apiFunc.valaddSchedule(), (req, res) => {
  console.log(req.body);
  let users_ID = req.session.users_ID;
  let type = req.session.userType;
  console.log(users_ID);
  // Call the fucntion to check for errors and return callback
  apiFunc.valErrors(req, (cb) => {
    // If input is invalid
    if (cb === 422) {
      log.info("failed to vailidate - addSchedule");
      res.status(422).send();
    }
    // If input is valid --> continue to db function
    if (cb === 200) {
      dbFunc.addSchedule(req, users_ID, (cb) => {
        if (cb === 0) {
          res.status(400).send();
        }
        if (cb === 201) {
          log.info("successfully inserted schedule", type);
          res.status(201).send();
        }
      });
    }
  });
});

// Post register details && call function to validate input
app.post("/regUser", jsonParser, apiFunc.valReg(), (req, res) => {
  console.log("got body", req.body);
  // Call the fucntion to check for errors and return callback
  apiFunc.valErrors(req, (cb) => {
    // If input is invalid
    if (cb === 422) {
      log.error("failed to validate - register");
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
  let ip = req.ip;
  log.info(`App visited, ip address: ${ip}`);
  apiFunc.valErrors(req, (cb) => {
    if (cb === 422) {
      log.info("Failed validation - login");
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
          log.info(`Successful login, userType: ${req.session.userType}`);
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
  let userID = req.session.users_ID;
  apiFunc.valErrors(req, (cb) => {
    if (cb === 422) {
      res.status(422).send();
    }
    if (cb === 200) {
      dbFunc.updateName(req, userID, (cb) => {
        if (cb === 400) {
          res.status(400).send();
        }
        if (cb === 201) {
          res.status(201).send();
        }
      });
    }
  });
});

// Fetch user name
app.get("/getUserName", jsonParser, (req, res) => {
  let userID = req.session.users_ID;
  dbFunc.getuserName(userID, (rows) => {
    if (rows === 400) {
      res.status(400).send();
    } else {
      console.log(rows);
      res.status(200).send(rows);
    }
  });
});

// Fetch next user event
app.get("/getUserEvent", jsonParser, (req, res) => {
  let userID = req.session.users_ID;
  dbFunc.getUserEvent(req, userID, (rows) => {
    if (rows === 400) {
      res.status(400).send();
    } else {
      console.log(rows);
      res.status(200).send(rows);
    }
  });
});

// Start server on this port
app.listen(port, () => {
  console.log(`listening at ${port} `);
});

module.exports = app;
