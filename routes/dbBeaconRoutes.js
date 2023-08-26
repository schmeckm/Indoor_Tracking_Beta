// Import necessary modules
const express = require('express');
const router = express.Router();

// Import methods from the beacon controller
const {
	addBeacon,
	getAllBeacons,
	deleteBeacon,
	updateBeacon,
	getSingleBeacon,
} = require('../controllers/dbBeaconController');

// Define route to add a new beacon
router.post('/addBeacon', addBeacon);

// Define route to fetch all beacons
router.get('/getAllBeacons', getAllBeacons);

// Define route to delete a specific beacon using its ID
router.delete('/deleteBeacon/:id', deleteBeacon);

// Define route to update details of a specific beacon using its ID
router.put('/updateBeacon/:id', updateBeacon);

// Define route to fetch details of a specific beacon using its ID
router.get('/getSingleBeacon/:id', getSingleBeacon);

// Export the router for use in other parts of the application
module.exports = router;
