const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
	zoneId: Number,
	environment: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Environment',
	},
	description: String,
	text1: String,
	text2: String,
});

module.exports = mongoose.model('zones', zoneSchema);
