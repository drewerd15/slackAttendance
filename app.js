const express = require("express");
const app = express();
module.exports = app;

app.get("/", (req, res, next) => {
  console.log("hello");
});
