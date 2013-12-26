var mongoose = require('mongoose');
var sensors = require('./sensors.js');
var equipment = require('./equipment.js');

var modelsensor = require('../models/Sensor.js');
var modelequipment = require('../models/Equipment.js');

var Sensor, Equipment, sio;

exports.socketio = function(io){
	sio = io.sockets;
}

// Main application view
exports.index = function(req, res) {
	res.render('index');
};

mongoose.connect('mongodb://localhost/brwry-dev');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('Connected to mongodb://localhost/brwry-dev')

	Sensor = modelsensor.Sensor;
	Equipment = modelequipment.Equipment;

	Sensor.remove({}, function(err) { 
		console.log('Sensor model removed (dev purposes)') 
	});

	Equipment.remove({}, function(err) { 
		console.log('Equipment model removed (dev purposes)') 
	});

	equipment.devPin(sio,Equipment);

	sensors.checkSensors(sio,Sensor);
	setInterval(function(){sensors.checkTemp(sio,Sensor)}, 2000);

	setTimeout(function(){
		equipment.initPins(sio,Equipment);
	},1000);
});

exports.connect = function(socket) {
	sensors.checkSensors(sio,Sensor);
	//socket.emit('gpiopinout',{'gpiopinout':gpioPins});
	equipment.pinStates(sio,Equipment);
	//socket.emit('allowablepins',{'allowablepins':allowablePins});
	equipment.allowablePins(sio);
	socket.on('send:toggleGPIO',function(gpioPin){
		//console.log('gpioPin',gpioPin);
		equipment.togglePin(sio,Equipment,gpioPin);
		//equipment.pinStates(sio,Equipment);
	});
	socket.on('send:updateGPIO', function(gpioPin){
		equipment.updatePin(sio,Equipment,gpioPin);
		//equipment.pinStates(sio,Equipment);
	});
	socket.on('send:removeGPIO',function(gpioPin){
		equipment.removePin(sio,Equipment,gpioPin);
		//equipment.pinStates(sio,Equipment);
	});
	/*
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
*/
	socket.on('send:updateSensor', function(sensor) {
		var activeUpdate;
		if (sensor.active == false) {
			activeUpdate = 0;
		} else {
			activeUpdate = 1;
		}
		console.log('activeUpdate:',activeUpdate)
		Sensor.update({address:sensor.address},{active:activeUpdate,
			calibration:sensor.calibration},function (err, numberAffected, raw) {
				if (err) console.log('Error:',err);
				console.log('The number of updated documents was %d', numberAffected);
				console.log('The raw response from Mongo was ', raw);
		});
//		setTimeout(function(){
			Sensor.find({},function (err, checksensors) {
				socket.emit('checksensors', {'checksensors': checksensors});
			});
//		},1000)
		checkTemp(sio,Sensor);
	});
}

exports.killPins = function(){
	return equipment.killPins(Equipment);
}