var mongoose = require('mongoose');

//Equipment Database (Name, GPIO Pins (address), Modes (On/Off/PID))
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
var Equipment = mongoose.model('Equipment', EquipmentSchema);
exports.Equipment = Equipment;