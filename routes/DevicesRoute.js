const express = require('express');
const router = express.Router();
const DevicesController = require('../controllers/DevicesController');

router.get('/', DevicesController.getAllDevices);
router.post('/find', DevicesController.getDeviceByName);

module.exports = router;
