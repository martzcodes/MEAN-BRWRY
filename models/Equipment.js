var mongoose = require('mongoose');

//Equipment Database (Name, GPIO Pins (address), Modes (On/Off/PID))
var equipmentSchema = new mongoose.Schema({
  name: String,
  type: String,
  address: String,
  location: String,
  modes: Array,
  linked: Array
});