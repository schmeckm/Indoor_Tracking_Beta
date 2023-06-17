const mongoose = require('mongoose');

const environmentSchema = new mongoose.Schema({
	name: String,
	description: String,
	text1: String,
	text2: String,
	width: Number,
	height: Number,
	distance_points: Number,
});

module.exports = mongoose.model('Environment', environmentSchema);
