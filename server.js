const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const nodemon = require("nodemon");
// const connection = require("./models/db");
const dbFunc = require("./models/db");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Home");
});

app.get("/users", (req, res) => {
  dbFunc.getUsers(res);
});

app.get("/schedule", (req, res) => {
  dbFunc.getSchedule(res);
});

app.post("/regUser", (req, res) => {
  dbFunc.regUser(res);
});

app.listen(port, () => {
  console.log(`listening at ${port} `);
});

module.exports = app;
