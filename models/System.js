var mongoose = require('mongoose');

var systemSchema = new mongoose.Schema({
	systemname: String,
	brewer: String,
	state: Number,
	currentbrew: String,
	currentbrewid: String
});
var System = mongoose.model('System', systemSchema);
exports.System = System;