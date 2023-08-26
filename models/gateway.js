const mongoose = require('mongoose');

const gatewaySchema = new mongoose.Schema(
	{
		timestamp: Date,
		type: String,
		gatewayMac: String,
		description: String,
		text1: String,
		text2: String,
		gatewayFree: Number,
		gatewayLoad: Number,
		gatewayX: Number,
		gatewayY: Number,
		latitude: Number,
		longitude: Number,
		sapLocation: String,
		tempCondition_Low: String,
		tempCondition_High: String,
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Gateway', gatewaySchema);
