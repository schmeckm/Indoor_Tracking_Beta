const express = require('express');
const router = express.Router();
const beaconController = require('../controllers/beaconController');

router.get('/getPosition', beaconController.getPosition);

module.exports = router;
