const express = require('express');
const router = express.Router();

const {
	addPlexValue,
	addCronValue,
	rssiDeleteTime,
	addFingerPrintDocuments,
	addMedian,
	resetSystem,
	addmath,
	updatemath,
	deletemath,
	jobruntime,
	addGatewayInterval,
	getSystemSettings,
} = require('../controllers/systemSettingsController');


router.post('/addPlexValue', addPlexValue);
router.post('/addCronValue', addCronValue);
router.post('/rssiDeleteTime', rssiDeleteTime);
router.post('/addFingerPrintDocuments', addFingerPrintDocuments);
router.post('/addMedian', addMedian);
router.post('/resetSystem', resetSystem);
router.post('/addmath', addmath);
router.post('/updatemath', updatemath);
router.post('/deletemath', deletemath);
router.post('/jobruntime', jobruntime);
router.post('/addGatewayInterval', addGatewayInterval);
router.get('/getSystemSettings', getSystemSettings);

module.exports = router;
