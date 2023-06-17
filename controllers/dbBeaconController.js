const dbBeacon = require('../models/dbBeacon');

const handleResponse = (res, success, data, errorMessage) => {
  if (success) {
    res.status(200).json({ success: true, data });
  } else {
    res.status(500).json({ success: false, error: errorMessage });
  }
};

exports.getAllBeacons = async (req, res) => {
  try {
    const beacons = await dbBeacon.find();
    handleResponse(res, true, beacons);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while retrieving beacons.');
  }
};

exports.addBeacon = async (req, res) => {
  try {
    const beacon = await dbBeacon.create(req.body);
    handleResponse(res, true, beacon);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while adding beacon.');
  }
};

exports.getSingleBeacon = async (req, res) => {
  try {
    const beacon = await dbBeacon.findById(req.params.id);
    handleResponse(res, true, beacon);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while retrieving beacon.');
  }
};

exports.updateBeacon = async (req, res) => {
  try {
    const beacon = await dbBeacon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    handleResponse(res, true, beacon);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while updating beacon.');
  }
};

exports.deleteBeacon = async (req, res) => {
  try {
    await dbBeacon.findByIdAndDelete(req.params.id);
    handleResponse(res, true, 'Beacon deleted successfully.');
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while deleting beacon.');
  }
};