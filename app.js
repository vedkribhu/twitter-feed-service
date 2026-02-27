"use strict";
var express_1 = require("express");
var app = express_1();
app.use(express_1.json());

app.get("/health", function (_, res) {
  res.send("ok");
});

app.get("/feed/:userId", function (req, res) {
  // var userId = req.params.userId;
  // TODO: Implement feed retrieval logic
  // res.json({
  //   userId: userId,
  //   feed: [],
  //   page: 1,
  //   limit: 20,
  // });
});

app.listen(3000, function () {
  console.log("Server running on port 3000");
});
