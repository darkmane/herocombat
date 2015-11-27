var path = require("path");
var cfg = require(path.join(__dirname, '..' , 'configuration', "config"));

exports.ping = function(req, res){
  res.send("pong!", 200);
};