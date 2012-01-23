// Require libraries
var fs = require("fs");
var express = require("express");
var site = express.createServer();
var request = require("request");

// Serve static files
site.use("/assets", express.static("./assets"));
site.use("/app", express.static("./app"));
site.use("/dist", express.static("./dist"));

// Ensure all routes go home, client side app..
site.get("*", function(req, res) {
  fs.createReadStream("./index.html").pipe(res);
});

// Actually listen
site.listen(80);
