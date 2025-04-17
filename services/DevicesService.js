const { getDB } = require('../db');

async function getAllDevices() {
    const db = getDB();
    const devices = await db.collection('devices').find().toArray();
    console.log(devices);
    return devices;
}

async function getDeviceByName(name) {
    const db = getDB();
    const device = await db.collection('devices').findOne({
        name: { $regex: `^${name}$`, $options: 'i' }
    });
    return device;
}

module.exports = { getAllDevices, getDeviceByName };
