// Import the necessary modules
const express = require('express');
const router = express.Router();

// Import the position controller
const positionController = require('../controllers/positionController');

// Define a GET route to retrieve the position
router.get('/getPosition', positionController.getPosition);

// Export the router for use in other parts of the application
module.exports = router;
