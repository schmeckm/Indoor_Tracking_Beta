const SystemSettings = require('../models/systemSettings');

// Add new system settings to the database.
exports.addSystemSettings = async (req, res) => {
	try {
	  // Create new system settings using the request body.
	  const systemSettings = await SystemSettings.create(req.body);
	  
	  // Send a successful response with the created settings.
	  handleResponse(res, true, systemSettings, null, 200);
	} catch (error) {
	  // Send an error response if the creation fails.
	  handleResponse(res, false, null, error.message, 500);
	}
};

// Retrieve all system settings from the database.
exports.getSystemSettings = async (req, res) => {
	try {
	  // Find all system settings.
	  const systemSettings = await SystemSettings.find();
	  
	  // Send a successful response with the retrieved settings.
	  res.status(200).json({
		  success: true,
		  data: systemSettings,
	  });
	} catch (error) {
	  // Send an error response if the retrieval fails.
	  res.status(500).json({ success: false, message: "Error while fetching system settings." });
	}
};

// Update a specific system setting by its ID.
exports.updateSystemSettings = async (req, res) => {
	try {
	  // Update the system settings using the request parameters (ID) and the request body.
	  const systemSettings = await SystemSettings.findByIdAndUpdate(req.params.id, req.body, { new: true });
	  
	  // Send a successful response with the updated settings.
	  handleResponse(res, true, systemSettings);
	} catch (error) {
	  console.error(error);
	  // Send an error response if the update fails.
	  handleResponse(res, false, null, 'Error while updating setting.', 500);
	}
};

// Utility function to handle responses, based on a success flag.
function handleResponse(res, success, data, errorMessage, statusCode = 200) {
	if (success) {
		// Send a successful response with the provided data.
		res.status(statusCode).json({ success: true, data: data });
	} else {
		// Send an error response with the provided error message.
		res.status(statusCode).json({ success: false, message: errorMessage });
	}
}
