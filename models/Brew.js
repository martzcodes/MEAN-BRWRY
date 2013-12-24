var mongoose = require('mongoose');

var recipeSchema = new mongoose.Schema({
	name: String,
	brewer: String,
	brewday: Date,
	sensors: Array,
	equipment: Array,
	steps: Array,
	status: String,
	previous: Array
});