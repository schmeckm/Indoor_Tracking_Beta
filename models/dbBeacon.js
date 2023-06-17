const mongoose = require('mongoose');

const beaconSchema = mongoose.Schema({
	timestamp: Date,
	description: String,
	beaconMac: String,
	beaconUUID: String,
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('dbBeacon', beaconSchema);
