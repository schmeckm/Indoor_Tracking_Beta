// Import required modules
const express = require('express');

// Initialize the router from the express module
const router = express.Router();

// Destructuring methods from the business object controller
// This imports the required controller functions for handling CRUD operations
const {
    addobject,       // Function to handle adding a new business object
    getobject,       // Function to handle fetching business objects
    updateobject,    // Function to handle updating a business object
    deleteobject,    // Function to handle deleting a business object

} = require('../controllers/businessObjectController');

// Define routes and their corresponding controller methods

// POST request to add a new business object
router.post('/addobject', addobject);

// GET request to fetch business objects
router.get('/getobject', getobject);

// PUT request to update a business object by ID
router.put('/updateobject/:beaconMac', updateobject);


// DELETE request to remove a business object by ID
router.delete('/deleteobject/:beaconMac', deleteobject);

// Export the router to be used in the main app
module.exports = router;
