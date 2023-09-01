// Import the express module to create the router.
const express = require('express');

// Initialize the express router.
const router = express.Router();

// Destructure the controller functions from the systemSettingsController module.
const {
	addSystemSettings,
	getSystemSettings,
	updateSystemSettings,
} = require('../controllers/systemSettingsController');

// Define the route to create system settings. This should likely be a POST route for data creation.
router.get('/addSystemSettings', addSystemSettings);

// Define the route to retrieve system settings.
router.get('/getSystemSettings', getSystemSettings);

// Define the route to update system settings. This should likely be a PUT or PATCH route for data updates.
router.get('/updateSystemSettings', updateSystemSettings);

// Export the router so it can be used in other modules.
module.exports = router;
