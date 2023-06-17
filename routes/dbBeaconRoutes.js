const express = require('express');
const router = express.Router();

const {
	addBeacon,
	getAllBeacons,
	deleteBeacon,
	updateBeacon,
	getSingleBeacon,
} = require('../controllers/dbBeaconController');

router.post('/addBeacon', addBeacon);
router.get('/getAllBeacons', getAllBeacons);
router.delete('/deleteBeacon/:id', deleteBeacon);
router.put('/updateBeacon/:id', updateBeacon);
router.get('/getSingleBeacon/:id', getSingleBeacon);

module.exports = router;
