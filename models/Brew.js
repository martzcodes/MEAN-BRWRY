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
	temperatureminute: Array,
	temperaturesecond: Array,
	dataequipment: Array
});
var Brew = mongoose.model('Brew', brewSchema);
exports.Brew = Brew;