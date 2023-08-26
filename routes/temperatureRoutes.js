// Import necessary modules
const express = require('express');
const router = express.Router();

// Import controller functions
const {
    addTemp,
    getTemperaturesBetweenDates,   // Add this part
    getBeaconDurationInSAPLocation
} = require('../controllers/temperatureController');

// Define POST route to add temperature
router.post('/addTemp', addTemp);

// Define GET route to fetch temperatures between dates
router.get('/getTemperaturesBetweenDates', getTemperaturesBetweenDates);

// Define GET route to retrieve the duration a beacon spent in a SAP location
router.get('/getBeaconDurationInSAPLocation', getBeaconDurationInSAPLocation);

// Export the router
module.exports = router;
