const SystemSettings = require('../models/systemSettings');
const distance = require('../models/distance');
const FingerPrinting = require('../models/fingerPrinting');
const kalmanvalues = require('../models/kalmanValues');


const moment = require('moment');
const rssi = require('../models/rssi');

exports.addPlexValue = async (req, res) => {
	const { plexValue } = req.body;
	const systemSettings = await SystemSettings.find();
	let newValue;
	if (systemSettings.length > 0) {
		newValue = await SystemSettings.findOneAndUpdate(
			{ _id: systemSettings[0]._id },
			{ $set: { plexValue } },
			{ new: true }
		);
	} else {
		newValue = await SystemSettings.create({
			plexValue: plexValue,
		});
	}

	res.status(200).json({
		success: true,
		data: newValue,
	});
};

exports.addCronValue = async (req, res) => {
	const { cronValue } = req.body;
	const systemSettings = await SystemSettings.find();
	let newValue;
	if (systemSettings.length > 0) {
		newValue = await SystemSettings.findOneAndUpdate(
			{ _id: systemSettings[0]._id },
			{ $set: { cronValue } },
			{ new: true }
		);
	} else {
		newValue = await SystemSettings.create({
			cronValue: cronValue,
		});
	}

	res.status(200).json({
		success: true,
		data: newValue,
	});
};

exports.addmath = async (req, res) => {
	const { gatewayMac, beaconMac, LinearRegressionFormula, RegressionSlope, RegressionIntercept, ExpRegressionConstanA, ExpRegressionConstanB } = req.body;
	try {
		const Regression = await Regression.create(req.body);

		res.status(200).json({
			success: true,
			data: Regression,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.updatemath = async (req, res) => {
	try {
		const { gatewayMac, beaconMac, LinearRegressionFormula, RegressionSlope, RegressionIntercept, ExpRegressionConstanA, ExpRegressionConstanB } = req.body;
		const Regression = await Regression.findOne(req.body.gatewayMac, req.body.beaconMac);

		if (!Regression) {
			return res.status(404).json({
				success: false,
				error: 'Regression was not found',
			});
		}

		if (req.body.gatewayMac) {
			return res.status(400).json({
				success: false,
				data: 'You cannot update the regressions',
			});
		}

		const updatedRegressing = await Regression.findByIdAndUpdate(
			req.body,
			{ new: true }
		);

		res.status(200).json({
			success: true,
			data: updatedRegressing,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.deletemath = async (req, res) => {
	try {
		const Regression = await Regression.findOne(req.body.gatewayMac, req.body.beaconMac);

		if (!regression) {
			return res.status(404).json({
				success: false,
				error: 'Regression was not found',
			});
		}

		await regressionfindOneAndDelete(req.body.gatewayMac, req.body.beaconMac);

		res.status(200).json({
			success: true,
			data: 'Regression has been deleted successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.rssiDeleteTime = async (req, res) => {
	const { rssiDeleteTime } = req.body;
	const systemSettings = await SystemSettings.find();
	let newValue;
	if (systemSettings.length > 0) {
		newValue = await SystemSettings.findOneAndUpdate(
			{ _id: systemSettings[0]._id },
			{ $set: { rssiDeleteTime } },
			{ new: true }
		);
	} else {
		newValue = await SystemSettings.create({
			rssiDeleteTime: rssiDeleteTime,
		});
	}

	res.status(200).json({
		success: true,
		data: newValue,
	});
};

exports.jobruntime = async (req, res) => {
	const { jobruntime } = req.body;
	const systemSettings = await SystemSettings.find();
	let newValue;
	if (systemSettings.length > 0) {
		newValue = await SystemSettings.findOneAndUpdate(
			{ _id: systemSettings[0]._id },
			{ $set: { jobruntime } },
			{ new: true }
		);
	} else {
		newValue = await SystemSettings.create({
			jobruntime: jobruntime,
		});
	}

	res.status(200).json({
		success: true,
		data: newValue,
	});
};

exports.addFingerPrintDocuments = async (req, res) => {
	const { fingerPrintDocuments } = req.body;
	const systemSettings = await SystemSettings.find();
	let newValue;
	if (systemSettings.length > 0) {
		newValue = await SystemSettings.findOneAndUpdate(
			{ _id: systemSettings[0]._id },
			{ $set: { fingerPrintDocuments } },
			{ new: true }
		);
	} else {
		newValue = await SystemSettings.create({
			fingerPrintDocuments: fingerPrintDocuments,
		});
	}

	res.status(200).json({
		success: true,
		data: newValue,
	});
};

exports.resetSystem = async (req, res) => {

	try {
		const rssi_delete = await rssi.deleteMany({});
		const distance_delete = await distance.deleteMany({});
		const Kalmanvalues_delete = await kalmanvalues.deleteMany({});
		const beacon_delete = await beacons.deleteMany({});

		const Numberrssi_deleted = rssi_delete.deletedCount;
		const Numberdistances_deleted = distance_delete.deletedCount;
		const Numberkalmanvalues_deleted = Kalmanvalues_delete.deletedCount;
		const NumberBeacon_deleted = beacon_delete.deletedCount;

		res.status(200).json({
			success: true,
			data: 'System reset successfully performed',
			Numberrssi_deleted,
			Numberdistances_deleted,
			Numberkalmanvalues_deleted,
			NumberBeacon_deleted,
		});

	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.addGatewayInterval = async (req, res) => {
	const { gatewayInterval } = req.body;
	const systemSettings = await SystemSettings.find();
	console.log(req.body);
	let newValue;
	if (systemSettings.length > 0) {
		newValue = await SystemSettings.findOneAndUpdate(
			{ _id: systemSettings[0]._id },
			{ $set: { gatewayInterval } },
			{ new: true }
		);
	} else {
		newValue = await SystemSettings.create({
			gatewayInterval: gatewayInterval,
		});
	}

	res.status(200).json({
		success: true,
		data: newValue,
	});
};

exports.addMedian = async (req, res) => {
	const { median } = req.body;
	const systemSettings = await SystemSettings.find();
	let newValue;
	if (systemSettings.length > 0) {
		newValue = await SystemSettings.findOneAndUpdate(
			{ _id: systemSettings[0]._id },
			{ $set: { median } },
			{ new: true }
		);
	} else {
		newValue = await SystemSettings.create({
			median: median,
		});
	}

	res.status(200).json({
		success: true,
		data: newValue,
	});
};

exports.getSystemSettings = async (req, res) => {
	const systemSettings = await SystemSettings.find();
	res.status(200).json({
		success: true,
		data: systemSettings,
	});
};
