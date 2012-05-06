
/**
 * Module dependencies.
 */

var express = require('express')
  , Resource = require('express-resource')
  , mongoose = require('mongoose')
  , controllers = require('./controllers')
  , models = require('./models')
  , routes = require('./routes');

var app = module.exports = express.createServer();

var port = 3000;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  mongoose.connect('mongodb://localhost/kittenmash');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  port = process.env.PORT;
  mongoose.connect(process.env.MONGOLAB_URI);
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.resource('scores', controllers.scores);

app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
