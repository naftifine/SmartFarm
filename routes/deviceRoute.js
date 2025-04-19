const express = require('express');
const router = express.Router();
const { getAllDevices, getDeviceByName } = require('../controllers/deviceController');

router.get('/', getAllDevices);
router.post('/find', getDeviceByName);

module.exports = router;
