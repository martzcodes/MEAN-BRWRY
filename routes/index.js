var mongoose = require('mongoose');
var sensors = require('./sensors.js');
var equipment = require('./equipment.js');
var system = require('./system.js');

var model = {system:require('../models/System.js')};
var modelsensor = require('../models/Sensor.js');
var modelequipment = require('../models/Equipment.js');

var Sensor, Equipment, System, sio;

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

	System = model.system.System;
/*
	System.remove({}, function(err) { 
		console.log('System model removed (dev purposes)') 
	});
*/

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
	system.loadSystem(sio,System);

	sensors.checkSensors(sio,Sensor);
	
	equipment.pinStates(sio,Equipment);
	
	equipment.allowablePins(sio);

	socket.on('send:updateSystem',function(data){
		system.updateSystem(sio,System,data);
	});
	socket.on('send:newBrew',function(data){
		system.newBrew(sio,System,data);
	});
	socket.on('send:stopBrew',function(){
		system.stopBrew(sio,System);
	});

	socket.on('send:toggleGPIO',function(gpioPin){
		equipment.togglePin(sio,Equipment,gpioPin);
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
	});

	socket.on('send:removeGPIO',function(gpioPin){
		equipment.removePin(sio,Equipment,gpioPin);
	});

	socket.on('send:updateSensor', function(sensor) {
		sensor.updateSensor(sio,Sensor,sensor);
	});
	socket.on('send:updateSensors', function(tempsensors) {
		sensor.updateSensors(sio,Sensor,tempsensors);
	});
}

exports.killPins = function(){
	return equipment.killPins(Equipment);
}