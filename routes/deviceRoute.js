const express = require('express');
const router = express.Router();
const { getAllDevices, getDeviceByName, createDevice } = require('../controllers/deviceController');

router.get('/', getAllDevices);
router.post('/find', getDeviceByName);
router.post('/', createDevice);

module.exports = router;
