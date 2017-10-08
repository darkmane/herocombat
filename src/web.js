/*jshint: laxcomma:true */

var fs = require('fs');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var hostname = require('os').hostname();
var express = require('express');
var routes = require('./routes');
var path = require('path');
var cfg = require(path.join(__dirname, 'configuration', "config"));
var app = express();
var env = (process.env.NODE_ENV || 'DEVELOPMENT').toLowerCase();
var winston = require('winston');
var npid = require('npid');


//if (cluster.isMaster) {
//  Logger.log("Master is forking workers");
//  for (var i=0; i<numCPUs; ++i) {
//    cluster.fork();
//  }
//  return;
//}

// npid.create(path.join(__dirname, "pids", ("pid." + process.pid) ));
npid.create(path.join(__dirname, "../shared/pids/node.pid"));

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'somefile.log' })
    ]
});

logger.log("Initiating worker, pid:" + process.pid);


app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, '/views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static('public'));
app.use('/webcomponents', express.static('bower_components'));

// app.get('/', routes.index);
app.get('/', function(req, response) {
		response.status(200).sendfile(path.join(__dirname, 'public', 'index.html'));			
});


subcategory_ids = [];

app.get('/ping', routes.ping);

app.listen(app.get('port'), function () {
    logger.log("Express".green.bold + " server listening on port " + (app.get('port') + "").green.bold);
});

logger.log("Started.");
