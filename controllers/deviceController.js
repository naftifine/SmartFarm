const deviceService = require('../services/deviceService');

const getAllDevices = async (req, res) => {
    try {
        const devices = await deviceService.getAllDevices();
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDeviceByName = async (req, res) => {
    try {   
        const device = await deviceService.getDeviceByName(req.body.name);
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.json(device);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllDevices, getDeviceByName };
