const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const nodemon = require("nodemon");
const bodyParser = require("body-parser");
const dbFunc = require("./models/db");
const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.set("trust proxy", 1);
app.use(
  session({
    name: "scheduleStuffCookie",
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
// Handle cors
app.use(cors());
// let corsOptions = {
//   origin: "http://localhost:3000",
//   optionsSuccessStatus: 204,
// };

let jsonParser = bodyParser.json();

app.get("/", (req, res) => {
  res.send("Home");
});

// Test route for all users`
app.get("/users", (req, res) => {
  dbFunc.getUsers(res);
});

// Retrieve schedule for user
app.get("/schedule", (req, res) => {
  dbFunc.getSchedule(req, res);
});

// Post register details
app.post("/regUser", jsonParser, (req, res) => {
  console.log("got body", req.body);
  res.sendStatus(200);
  dbFunc.regUser(req, res);
});

// Handle the login
app.post("/login", jsonParser, (req, res) => {
  console.log("got body", req.body);
  res.sendStatus(200);
  dbFunc.login(req, res);
});

// Start server on this port
app.listen(port, () => {
  console.log(`listening at ${port} `);
});

module.exports = app;
