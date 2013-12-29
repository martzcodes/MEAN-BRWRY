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

exports.setup = function(req, res) {
	res.render('setup');
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
	
	equipment.pinStates(sio,Equipment);
	
	equipment.allowablePins(sio);

	socket.on('send:toggleGPIO',function(gpioPin){
		//console.log('gpioPin',gpioPin);
		equipment.togglePin(sio,Equipment,gpioPin);
		//equipment.pinStates(sio,Equipment);
	});

	socket.on('send:toggleAllGPIO',function(){
		//Turn all pins off (emergency off)
		equipment.toggleAllPin(sio,Equipment);
	});

	socket.on('send:updateGPIO', function(gpioPin){
		equipment.updatePin(sio,Equipment,gpioPin);
	});

	socket.on('send:updateAllGPIO', function(gpioPin){
		equipment.updateAllPin(sio,Equipment,gpioPin);
		//equipment.pinStates(sio,Equipment);
	});

	socket.on('send:removeGPIO',function(gpioPin){
		equipment.removePin(sio,Equipment,gpioPin);
		//equipment.pinStates(sio,Equipment);
	});

	socket.on('send:updateSensor', function(sensor) {
		Sensor.update({address:sensor.address},{active:sensor.active,
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
		sensors.checkTemp(sio,Sensor);
	});
}

exports.killPins = function(){
	return equipment.killPins(Equipment);
}