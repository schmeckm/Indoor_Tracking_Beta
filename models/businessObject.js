const mongoose = require('mongoose');

const businessObjectSchema = mongoose.Schema(
	{
		beaconMac: String,
		material: String,
		batch: String,
		handlingUnit: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model('businessObject', businessObjectSchema);

