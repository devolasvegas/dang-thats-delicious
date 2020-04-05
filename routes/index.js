const express = require("express");
const router = express.Router();

// Do work here
router.get("/", (req, res) => {
  // res.send("Hey! It works!");

  res.json(req.query);
});

router.get("/reverse/:name/:last/:age", (req, res) => {
  const reverse = [...req.params.name].reverse().join("");
  res.send(reverse);
});

module.exports = router;
