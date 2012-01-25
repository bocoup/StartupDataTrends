
/**
 * Module dependencies.
 */

var http = require('http');

http.createServer(function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
}).listen(3000);