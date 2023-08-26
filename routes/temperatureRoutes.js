const express = require('express');
const router = express.Router();
const {
    addTemp,
    getTemperaturesBetweenDates, // Diesen Teil hinzufügen
    getBeaconDurationInSAPLocation
} = require('../controllers/temperatureController');

router.post('/addTemp', addTemp);
router.get('/getTemperaturesBetweenDates', getTemperaturesBetweenDates);
router.get('/getBeaconDurationInSAPLocation', getBeaconDurationInSAPLocation);

module.exports = router;
