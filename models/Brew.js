var mongoose = require('mongoose');

var brewSchema = new mongoose.Schema({
	name: String,
	brewer: String,
	brewday: Date,
	sensors: Array,
	equipment: Array,
	steps: Array,
	status: String,
	previous: Array,
	temperatureminute: Array, //"fixed" size, 600 points (600 minutes, 10 hours)
	temperaturesecond: Array, //"fixed" size, 600 points (600 seconds, 10 minutes)
	dataequipment: Array
});
var Brew = mongoose.model('Brew', brewSchema);
exports.Brew = Brew;