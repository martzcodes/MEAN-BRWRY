var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var sense = require('ds18b20');
var gpio = require('rpi-gpio');

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

//io.sockets.on('connection', routes.receive);

//For Development/Testing:
//Note: for common anode LEDs I initialize them to 1 so that they are off.
//Normal devices should be initialied at 0 (I think)
var initdate = '';
var allowablePins = [11,12,13,15,16,18];
var gpioPins = [{pin:11,value:1,date:initdate,safeValue:1,mode:"write"}];
var tempSensors = [{sensor:"28-000003cb5b7c",calibration:0,value:-1,lastValue:-1,date:initdate,active:1}];


gpioPins.forEach(function(gpioPin){
	gpio.setup(gpioPin.pin, gpio.DIR_OUT, initPin(gpioPin));
})
checkSensors();
setInterval(function(){checkTemp()}, 2000);

io.sockets.on('connection', function(socket){
	checkSensors();
	socket.emit('gpiopinout',{'gpiopinout':gpioPins});
	socket.emit('allowablepins',{'allowablepins':allowablePins});
	socket.on('send:toggleGPIO', function(gpioPin) {
		gpioPins.forEach(function(singlePin){
			if (singlePin.pin == gpioPin.pin) {
				//pin has been setup previously
				var newValue = singlePin.safeValue; //default off
				if (singlePin.value == 1) {
					newValue = 0;
				} else {
					newValue = 1;
				}
				gpio.write(gpioPin.pin, newValue, function(err){
					console.log(newValue,'written to',gpioPin.pin);
				});
				singlePin.value = newValue;
				singlePin.date = Date();
				socket.emit('gpiopinout',{'gpiopinout':gpioPins});
			} else {
				//pin hasn't been setup... not sure how it's being controlled
				//setup pin and set value
			};
		});
	});
	socket.on('send:updateGPIO', function(updatePin) {
		var pinCheck = -1;
		allowablePins.forEach(function(allowablePin){
			if (allowablePin == updatePin.pin) {
				pinCheck = 0;
			}
		})
		if (pinCheck != -1) {
			gpioPins.forEach(function(gpioPin){
				if (gpioPin.pin == updatePin.pin) {
					pinCheck = 1; //exists
					if (updatePin.value == true) {
						gpioPin.value = 1;
					} else if (updatePin.value == false) {
						gpioPin.value = 0;
					} else {
						gpioPin.value = updatePin.value;
					}
					gpio.write(gpioPin.pin, gpioPin.value, function(err){
						console.log(gpioPin.value,'written to',gpioPin.pin);
					});
					gpioPin.mode = updatePin.mode;
					if (updatePin.safeValue == true) {
						gpioPin.safeValue = 1;
					} else if (updatePin.safeValue == false) {
						gpioPin.safeValue = 0;
					} else {
						gpioPin.safeValue = updatePin.safeValue;
					}
					gpioPin.date = Date();
				}
			});
		}
		if (pinCheck == 0) {
			updatePin.date = Date();
			gpioPins.push(updatePin);
			gpio.setup(updatePin.pin, gpio.DIR_OUT, initPin(updatePin))
		}
		socket.emit('gpiopinout',{'gpiopinout':gpioPins});
	});
	socket.on('send:removeGPIO', function(removePin){
		gpio.write(gpioPin.pin, removePin.safeValue);

		var replacePins = [];
		gpioPins.forEach(function(gpioPin){
			if (removePin.pin != gpioPin.pin) {
				replacePins.push(gpioPin);
			}
		})
		gpioPins = replacePins;
		socket.emit('gpiopinout',{'gpiopinout':gpioPins});
	})
	socket.on('send:updateSensor', function(sensor) {
		tempSensors.forEach(function(tempSensor){
			if (sensor.sensor == tempSensor.sensor) {
				tempSensor.active = sensor.active;
				tempSensor.calibration = sensor.calibration;
			}
		})
		socket.emit('checksensors', {'checksensors': tempSensors});
		checkTemp();
	});
});

function initPin(gpioPin) {
	setTimeout(function(){
		gpio.read(gpioPin.pin,function(err,readvalue){
			if (readvalue != gpioPin.value) {
				gpio.write(gpioPin.pin,gpioPin.value, function(err){
					console.log(gpioPin.value,'written to',gpioPin.pin);
				});
			}
		})
	},500)
};

function checkSensors(){
	sense.sensors(function(err, ids) {
		ids.forEach(function(sensor){
			var sensorStored = 0;
			tempSensors.forEach(function(tempSensor){
				if (tempSensor.sensor == sensor) {
					sensorStored = 1;
				}
			});
			if (sensorStored == 0) {
				tempSensors.push({sensor:sensor,calibration:0,value:-1,lastValue:-1,date:'',active:1})
			}
		});
	});
	setTimeout(function(){
		io.sockets.emit('checksensors', {'checksensors': tempSensors});
	},1000)
	checkTemp();
}

function checkTemp(){
	tempSensors.forEach(function(tempSensor) {
		sense.temperature(tempSensor.sensor, function(err, value) {
			tempSensor.lastValue = tempSensor.value;
			tempSensor.value = value + tempSensor.calibration;
			tempSensor.date = Date();
		  	//console.log('Current temperature is', value, 'for sensor', sensor, 'at',Date());
		});                
	})
	setTimeout(function(){
		io.sockets.emit('tempout', {'tempout': tempSensors});
		return tempSensors;
	},1000)
}

server.listen(app.get('theport'),app.get('theip'), function() {
	console.log('BRWRY running on ' + app.get('theip') + ':' + app.get('theport'));
});

process.stdin.resume();//so the program will not close instantly
process.on('exit', function (){
	console.log('Goodbye!');
});
process.on('SIGINT', function () {
	console.log('Got SIGINT.  Exiting...');
	gpioPins.forEach(function(gpioPin){
		//for common anode LEDs only, otherwise you'd set them to 0 (off)
		gpioPin.value = 1;
		gpio.write(gpioPin.pin, 1);
	})
	gpio.destroy(function() {
  		console.log('All pins unexported');
    	return process.exit(0);
	});
	setTimeout(function(){
		process.exit();	
	}, 1000);
});