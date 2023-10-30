// Importing the beacon model
const dbBeacon = require('../models/dbBeacon');

// A utility function to handle and streamline API responses
const handleResponse = (res, success, data, errorMessage, statusCode = 500) => {
  if (success) {
    res.status(200).json({ success: true, data });
  } else {
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};;

// Validate ID format
const isValidId = (id) => {
  // Implement your ID validation logic here
  // Example: check if it's a valid MongoDB ObjectId
  return id.match(/^[0-9a-fA-F]{24}$/);
};

// Fetch all the beacons from the database
exports.getAllBeacons = async (req, res) => {
  try {
    const beacons = await dbBeacon.find();
    handleResponse(res, true, beacons);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while retrieving beacons.');
  }
};

// Add a new beacon to the database
exports.addBeacon = async (req, res) => {
  try {
    const beacon = await dbBeacon.create(req.body);
    handleResponse(res, true, beacon);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while adding beacon.');
  }
};

// Fetch details of a specific beacon using its ID
exports.getSingleBeacon = async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) {
      return handleResponse(res, false, null, 'Invalid ID format.', 400);
    }

    const beacon = await dbBeacon.findById(id);
    if (!beacon) {
      return handleResponse(res, false, null, 'Beacon not found.', 404);
    }
    handleResponse(res, true, beacon);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while retrieving beacon.', 500);
  }
};

exports.getBeaconByMac = async (req, res) => {
  try {
    // Validate MAC address
    const mac = req.params.macAddress;
    console.log(`Fetching beacon with MAC: ${mac}`);
    const beacon = await dbBeacon.findOne({ beaconMac: mac });
    if (!beacon) {
      return handleResponse(res, false, null, 'Beacon not found.', 404);
    }

    handleResponse(res, true, beacon);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while retrieving beacon.', 500);
  }
};

// Update details of a specific beacon using its ID
exports.updateBeacon = async (req, res) => {
  try {
    const beacon = await dbBeacon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    handleResponse(res, true, beacon);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while updating beacon.');

  }
};

// Delete a specific beacon using its ID
exports.deleteBeacon = async (req, res) => {
  try {
    await dbBeacon.findByIdAndDelete(req.params.id);
    handleResponse(res, true, 'Beacon deleted successfully.');
  } catch (error) {
    console.error(error);
    handleResponse(res, false, null, 'Error while deleting beacon.');
  }
};
