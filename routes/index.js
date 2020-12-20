var express = require("express");
var router = express.Router();

// rendering index.js (log in/sign up view)
router.get("/", function (req, res, next) {
  res.render("index", { title: "What A day" });
});

module.exports = router;
