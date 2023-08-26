const express = require('express');
const router = express.Router();

const {
	addZone,
	getAllZones,
	deleteZone,
	updateZone,
	getSingleZone,
} = require('../controllers/zoneController');


router.post('/addZone', addZone);
router.get('/getAllZones', getAllZones);
router.delete('/deleteZone/:zoneId', deleteZone);
router.put('/updateZone/:zoneId', updateZone);
router.get('/getSingleZone/:zoneId', getSingleZone);

module.exports = router;
