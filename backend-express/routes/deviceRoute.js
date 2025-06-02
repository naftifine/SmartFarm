const express = require('express');
const router = express.Router();
const { getAllDevices, getDeviceByName, createDevice, updateDevice, deleteDeviceById } = require('../controllers/deviceController');

router.get('/', getAllDevices);
router.post('/find', getDeviceByName);
router.post('/', createDevice);
router.put('/:deviceId', updateDevice);
router.delete('/:deviceId', deleteDeviceById);

module.exports = router;
