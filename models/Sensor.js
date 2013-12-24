var mongoose = require('mongoose');

//Sensor Database (Address, Calibration, Name, Linked Items (Equipment))
var sensorSchema = new mongoose.Schema({
  name: String,
  type: String,
  address: String,
  location: String,
  calibration: Number,
  linked: Array
});