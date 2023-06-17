const mongoose = require('mongoose');

const beaconSchema = mongoose.Schema(
	{
		beaconMac: String,
		gatewayId: {
			type: mongoose.Schema.ObjectId,
			ref: 'Gateway',
		},
		timestamp: Date,
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Beacon', beaconSchema);
