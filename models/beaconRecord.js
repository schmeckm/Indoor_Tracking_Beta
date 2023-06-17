const mongoose = require('mongoose');

const beaconResultSchema = mongoose.Schema(
	{
		beaconMac: String,
		gatewayMac: String,
		positionX: String,
		positionY: String,
		distance: String,
		deviation: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model('BeaconRecord', beaconResultSchema);

