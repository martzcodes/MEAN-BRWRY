var mongoose = require('mongoose');

//Sensor Database (Address, Calibration, Name, Linked Items (Equipment)), etc
var sensorSchema = mongoose.Schema({
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