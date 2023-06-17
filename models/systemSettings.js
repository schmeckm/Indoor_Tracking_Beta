const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
	plexValue: Number,
	cronValue: Number,
	rssiDeleteTime: Number,
	fingerPrintDocuments: Number,
	median: {
		type: Boolean,
		default: false,
	},
	gatewayInterval: Number,
	machineLearning: {
		type: Boolean,
		default: false,
	},

});
module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
