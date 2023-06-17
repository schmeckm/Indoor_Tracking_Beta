const express = require('express');
const router = express.Router();

const {
	addEnvironment,
	getAllEnvironments,
	deleteEnvironment,
	updateEnvironment,
	getSingleEnvironment,
} = require('../controllers/environmentController');


router.post('/addEnvironment', addEnvironment);
router.get('/getAllEnvironments', getAllEnvironments);
router.delete('/deleteEnvironment/:environmentId', deleteEnvironment);
router.put('/updateEnvironment/:environmentId', updateEnvironment);
router.get('/getSingleEnvironment/:environmentId', getSingleEnvironment);

module.exports = router;
