var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
//var sense = require('ds18b20');
//var gpio = require('rpi-gpio');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.set('theport', process.env.VCAP_APP_PORT || 3000);
app.set('theip', process.env.VCAP_APP_IP || "0.0.0.0");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Handle Errors
app.use(function(err, req, res, next) {
	if(!err) return next();
	console.log(err.stack);
	res.json({error: true});
});

//Pass io to routes so that other modules can use it
routes.socketio(io);

// Main App
app.get('/', routes.index);

//MongoDB API Routes
/*app.get('/setup', routes.setup);
app.post('/setup', routes.setup);
app.get('/recipe', routes.recipelist);
app.post('/recipe', routes.recipe); //Create a brew
app.get('/recipe/:recipeid', routes.recipe);
app.post('/recipe/:recipeid', routes.recipe); //Edit a brew
app.get('/history/history', routes.historylist);
app.get('/history/:historyid', routes.history);
*/

io.sockets.on('connection',routes.connect)

server.listen(app.get('theport'),app.get('theip'), function() {
	console.log('BRWRY running on ' + app.get('theip') + ':' + app.get('theport'));
});

process.stdin.resume();//so the program will not close instantly
process.on('exit', function (){
	console.log('Goodbye!');
});
process.on('SIGINT', function () {
	console.log('Got SIGINT.  Exiting...');
	routes.killPins();
	setTimeout(function(){
		process.exit();	
	}, 1000);
});