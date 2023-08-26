// Import necessary modules
const express = require('express');
const router = express.Router();

// Import methods from the environment controller
const {
	addEnvironment,
	getAllEnvironments,
	deleteEnvironment,
	updateEnvironment,
	getSingleEnvironment,
} = require('../controllers/environmentController');

// Define route to add a new environment
router.post('/addEnvironment', addEnvironment);

// Define route to fetch all environments
router.get('/getAllEnvironments', getAllEnvironments);

// Define route to delete a specific environment using its ID
router.delete('/deleteEnvironment/:environmentId', deleteEnvironment);

// Define route to update details of a specific environment using its ID
router.put('/updateEnvironment/:environmentId', updateEnvironment);

// Define route to fetch details of a specific environment using its ID
router.get('/getSingleEnvironment/:environmentId', getSingleEnvironment);

// Export the router for use in other parts of the application
module.exports = router;
