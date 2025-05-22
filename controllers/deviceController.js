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

const createDevice = async (req, res) => {
    try {
        const device = await deviceService.createDevice(req.body);
        res.status(201).json(device);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateDevice = async (req, res) => {
    const { deviceId } = req.params;
    try {
        const device = await deviceService.updateDevice(deviceId, req.body);
        res.status(201).json(device);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteDeviceById = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const result = await deviceService.deleteDeviceById(deviceId);
        if (!result) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json({ message: 'Device deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllDevices, getDeviceByName, createDevice, updateDevice, deleteDeviceById };
