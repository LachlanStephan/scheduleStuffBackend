const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const nodemon = require("nodemon");
const bodyParser = require("body-parser");
const dbFunc = require("./models/db");

// Handle cors errors
app.use(cors());

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
  dbFunc.getSchedule(res);
});

// Post register details
app.post("/regUser", jsonParser, (req, res) => {
  console.log("got body", req.body);
  res.sendStatus(200);
  dbFunc.regUser(req);
});

app.listen(port, () => {
  console.log(`listening at ${port} `);
});

module.exports = app;
