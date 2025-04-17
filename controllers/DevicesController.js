const DeviceService = require('../services/DevicesService');

exports.getAllDevices = async (req, res, next) => {
    try {
        const devices = await DeviceService.getAllDevices();
        res.json(devices);
    } catch (err) {
        next(err);
    }
};

exports.getDeviceByName = async (req, res, next) => {
    try {   
        const device = await DeviceService.getDeviceByName(req.body.name);
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.json(device);
    } catch (err) {
        next(err);
    }
};

