const express = require('express');
const router = express.Router();

const {
	getAllGateways,
	addGateway,
	deleteGateway,
	updateGateway,
	getSingleGateway,
	getSingleGatewayByMAC,
	
} = require('../controllers/gatewayController');

router.get('/getAllGateways', getAllGateways);
router.post('/addGateway', addGateway);
router.delete('/deleteGateway/:gatewayId', deleteGateway);
router.put('/updateGateway/:gatewayId', updateGateway);
router.get('/getSingleGateway/:gatewayId', getSingleGateway);
router.get('/getSingleGatewayByMAC/:gatewayId', getSingleGatewayByMAC);

module.exports = router;
