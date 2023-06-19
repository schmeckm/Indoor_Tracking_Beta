const zone = require('../models/zones');

exports.getAllZones = async (req, res) => {

	var options = {
		allowDiskUse: true
	};

	var pipeline = [
		{
			"$project": {
				"_id": 0,
				"zone_ids": "$$ROOT"
			}
		},
		{
			"$lookup": {
				"localField": "zone.environment",
				"from": "environments",
				"foreignField": "_id",
				"as": "environments"
			}
		},
		{
			"$unwind": {
				"path": "$environments",
				"preserveNullAndEmptyArrays": false
			}
		},
		{
			"$project": {
				"zone._id": "$zone._id",
				"zone.zoneId": "$zone.zoneId",
				"zone.description": "$zone.description",
				"zone.text1": "$zone.text1",
				"zone.text2": "$zone.text2",
				"environments.description": "$environments.description",
				"_id": 0
			}
		}
	];

	try {

		const zones = await zone.aggregate(pipeline, options);
		res.status(200).json({
			success: true,
			data: zones,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.addZone = async (req, res) => {
	try {
		const zone = await zone.create(req.body);
		res.status(200).json({
			success: true,
			data: zone,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.deleteZone = async (req, res) => {
	try {
		c

		const zone = await zone.findOne({ _id: zoneId });

		if (!zone) {
			return res.status(404).json({
				success: false,
				error: 'Zone not found',
			});
		}

		await Zone_Id.findOneAndDelete({ _id: zoneId });

		res.status(200).json({
			success: true,
			data: 'Zone Deleted Successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.updateZone = async (req, res) => {
	try {
		const { zoneId } = req.params;

		const zone = await zone.findOne({ _id: zoneId });

		if (!zone) {
			return res.status(404).json({
				success: false,
				error: 'Zone not found',
			});
		}

		await zone.findOneAndUpdate({ _id: zoneId }, req.body);

		res.status(200).json({
			success: true,
			data: 'Zone Updated Successfully',
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.getSingleZone = async (req, res) => {
	try {
		const { zoneId } = req.params;

		const zone = await zone.findOne({ _id: zoneId });

		if (!zone) {
			return res.status(404).json({
				success: false,
				error: 'Zone not found',
			});
		}

		res.status(200).json({
			success: true,
			data: zone,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};