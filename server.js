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
const { body, check, validationResult } = require("express-validator");

//////////////////////////////////////////
// Notes to self
// Use npm winston for logging ---> make logging table
// Use crypto-js for hashing passwords
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
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// To rate limit the API from spam/bots
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15mins
  max: 100, // limit each IP to 100 requests per windowMS
});

// *********** to change this to fit assess criteria, will need a 2nd one as well ********* //
app.use(limiter);

// To parse json data
let jsonParser = bodyParser.json();

// Retrieve schedule for user
app.get("/schedule", (req, res) => {
  // Assign the user ID
  let isLoggedin = req.session.isLoggedin;
  let users_ID = req.session.users_ID;
  console.log(users_ID);
  // Parse userID to query
  dbFunc.getSchedule(users_ID, (rows) => {
    if ((isLoggedin = false)) {
      res.status(401).send();
    }
    // Connected but no content
    if (rows === 0) {
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
  console.log(users_ID);
  // Call the fucntion to check for errors and return callback
  apiFunc.valaddScheduleErr(req, (cb) => {
    // If input is invalid
    if (cb === 422) {
      res.status(422).send();
    }
    // If input is valid --> continue to db function
    if (cb === 200) {
      dbFunc.addSchedule(req, users_ID, (cb) => {
        if (cb === 0) {
          res.status(400).send();
        }
        if (cb === 201) {
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
  apiFunc.valRegErr(req, (cb) => {
    // If input is invalid
    if (cb === 422) {
      res.status(422).send();
    }
    // If input is valid --> continue to db function
    if (cb === 200) {
      dbFunc.regUser(req, (userCheck) => {
        if (userCheck === 0) {
          console.log("failed");
        }
        // If email exists send 409
        if (userCheck === 409) {
          res.status(409).send();
        }
        // If correct ---> send 201 && set session
        if (userCheck === 201) {
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
app.post("/login", jsonParser, (req, res) => {
  console.log("got body", req.body);
  dbFunc.login(req, (users_ID) => {
    // Check if this is a valid userID
    if (users_ID === 0) {
      res.status(401).send("this login does not exist");
      req.session.isLoggedin = false;
    } else {
      // If valid ----> set session and 200 ok
      req.session.isLoggedin = true;
      req.session.users_ID = users_ID;
      res.status(200).send("session set and user logged in");
      console.log("success", users_ID, req.session);
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

// Users to update their names
app.patch("/updateName", jsonParser, (req, res) => {
  console.log("got body", req.body);
  let userID = req.session.users_ID;
  dbFunc.updateName(req, userID, (cb) => {
    if (cb === 400) {
      res.status(400).send();
    }
    if (cb === 201) {
      res.status(201).send();
    }
  });
});

// Start server on this port
app.listen(port, () => {
  console.log(`listening at ${port} `);
});

module.exports = app;
