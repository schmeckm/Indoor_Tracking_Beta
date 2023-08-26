// Import required modules
const express = require('express');
const router = express.Router();

// Import gateway controller methods
const {
	getAllGateways,
	addGateway,
	deleteGateway,
	updateGateway,
	getSingleGateway,
	getSingleGatewayByMAC,
} = require('../controllers/gatewayController');

// Define route to fetch all gateways
router.get('/getAllGateways', getAllGateways);

// Define route to add a new gateway
router.post('/addGateway', addGateway);

// Define route to delete a specific gateway using its ID
router.delete('/deleteGateway/:gatewayId', deleteGateway);

// Define route to update details of a specific gateway using its ID
router.put('/updateGateway/:gatewayId', updateGateway);

// Define route to fetch details of a specific gateway using its ID
router.get('/getSingleGateway/:gatewayId', getSingleGateway);

// Define route to fetch a gateway using its MAC address (though the parameter name is gatewayId)
router.get('/getSingleGatewayByMAC/:gatewayId', getSingleGatewayByMAC);

// Export the router for use in other parts of the application
module.exports = router;
