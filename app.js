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

//Moving into DB section
/*
gpioPins.forEach(function(gpioPin){
	gpio.setup(gpioPin.pin, gpio.DIR_OUT, initPin(gpioPin));
})
checkSensors();
setInterval(function(){checkTemp()}, 2000);
*/

////////////////////////////
//DB stuff

// Connect to MongoDB using Mongoose
var mongoose = require('mongoose');

var Sensor, Equipment;

mongoose.connect('mongodb://localhost/brwry-dev');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('Connected to mongodb://localhost/brwry-dev')

	// Get Sensor schema and model
	//var SensorSchema = require('../models/Sensor.js').sensorSchema;
	//var SensorSchema = require('./models/Sensor.js').sensorSchema;
	var SensorSchema = mongoose.Schema({
		name: String, //Name
		type: String, //Normally temperature (don't want to prevent using other types of senors), not used
		address: String, //addressed used to get readings
		location: String, //description of where this is placed in the brewing process
		calibration: Number, //Calibration number (if the sensor is off by a set amount)
		value: Number, //current reading
		date: Date, //time of current reading
		lastValue: Number, //last reading
		active: Number, //Is it being used?
		linked: Array  //Is it linked to anything else (PID control of something)
	});
	Sensor = mongoose.model('Sensor', SensorSchema);

	Sensor.remove({}, function(err) { 
		console.log('Sensor model removed (dev purposes)') 
	});

	// Get Equipment schema and model
	//var EquipmentSchema = require('../models/Equipment.js').equipmentSchema;
	//var EquipmentSchema = require('./models/Equipment.js').equipmentSchema;
	var EquipmentSchema = mongoose.Schema({
		name: String,
		type: String,  //Pump,Heating Element, Valve, etc
		address: String, //GPIO Pin
		location: String, //Description of where it is in the process
		modes: Array, //(On/Off/PID)
		value: Number, //1 or 0 (on or off)
		state: Number, //what mode it's in (0 is off, 1 is on, anything else is a target for PID)
		date: Date, //last command change
		pidtime: Number, //seconds between on/off if PID controlled
		laststate: Date,  //used to determine seconds between on/off if PID controlled
		safeValue: Number,
		linked: Array
	});
	Equipment = mongoose.model('Equipment', EquipmentSchema);

	Equipment.remove({}, function(err) { 
		console.log('Equipment model removed (dev purposes)') 
	});

	gpioPins.forEach(function(gpioPin){
		gpio.setup(gpioPin.pin, gpio.DIR_OUT, initPin(gpioPin));
	})
	//checkSensors(Sensor);
	checkSensors();
	//setInterval(function(){checkTemp()}, 2000);
});

//End DB stuff
////////////////////////////

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
//function checkSensors(Sensor) {
	sense.sensors(function(err, ids) {
		ids.forEach(function(sensor){
			Sensor.find({address:sensor},function (err, sensors) {
				if (err) {
					console.log("error: ",error)
				}
				if (sensors.length == 0) {
					Sensor.create({
						name: 'unnamed', //Name
						type: 'Temperature', //Normally temperature (don't want to prevent using other types of senors), not used
						address: sensor, //addressed used to get readings
						location: 'No Where', //description of where this is placed in the brewing process
						calibration: 0, //Calibration number (if the sensor is off by a set amount)
						value: -1, //current reading
						date: Date(), //time of current reading
						lastValue: -1, //last reading
						active: 1, //Is it being used?
						linked: []  //Is it linked to anything else (PID control of something)
					});
					console.log('Created sensor',sensor,'!')
				}
			})
			/*
			var sensorStored = 0;
			tempSensors.forEach(function(tempSensor){
				if (tempSensor.sensor == sensor) {
					sensorStored = 1;
				}
			});
			if (sensorStored == 0) {
				tempSensors.push({sensor:sensor,calibration:0,value:-1,lastValue:-1,date:'',active:1})
			}
			*/
		});
	});
	setTimeout(function(){
		//io.sockets.emit('checksensors', {'checksensors': tempSensors});
		Sensor.find({},function (err, sensors) {
			console.log('Mongo Sensors: ',sensors)
		});
	},1000)
	//checkTemp();
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
		gpioPin.value = gpioPin.safeValue;
		gpio.write(gpioPin.pin, gpioPin.safeValue);
	})
	gpio.destroy(function() {
  		console.log('All pins unexported');
    	return process.exit(0);
	});
	setTimeout(function(){
		process.exit();	
	}, 1000);
});