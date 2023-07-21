const mongoose = require('mongoose');

const environmentSchema = new mongoose.Schema({
	name: String,
	description: String,
	text1: String,
	text2: String,
	width: Number,
	height: Number,
	distance_points: Number,
	image: String, // or specify the appropriate data type for the image field
});

module.exports = mongoose.model('Environment', environmentSchema);
