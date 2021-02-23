const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const mysql = require("mysql");
require("dotenv").config({ path: "./config/.env" });
const nodemon = require("nodemon");

app.use(cors());

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
});
conn.connect();

app.get("/", (req, res) => {
  res.send("check");
});

app.get("/users", (req, res) => {
  conn.query("SELECT * FROM users", (err, results) => {
    if (!err) {
      res.status("201").send(results);
    } else {
      console.log(err);
    }
  });
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
