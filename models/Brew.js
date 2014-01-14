var mongoose = require('mongoose');

var recipeSchema = new mongoose.Schema({
	name: String,
	brewer: String,
	brewday: Date,
	sensors: Array,
	equipment: Array,
	steps: Array,
	status: String,
	previous: Array,
	dataminute: Array, //"fixed" size, 600 points (600 minutes, 10 hours)
	datasecond: Array, //"fixed" size, 600 points (600 seconds, 10 minutes)
});