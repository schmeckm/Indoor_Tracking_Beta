const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');

router.get('/getPosition', positionController.getPosition);

module.exports = router;
