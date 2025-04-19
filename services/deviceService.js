const { getDB } = require('../config/db');

async function getAllDevices() {
    try {
        const db = getDB();
        const devices = await db.collection('devices').find().toArray();
        // console.log(devices);
        return devices;
    } catch (error) {
        throw new Error('Error fetching: ' + error.message);
    }
}
        

async function getDeviceByName(name) {
    try {
        const db = getDB();
        const device = await db.collection('devices').findOne({
            name: { $regex: `^${name}$`, $options: 'i' }
        });
        return device;
    } catch (error) {
        throw new Error('Error fetching: ' + error.message);
    }
    
}

module.exports = { getAllDevices, getDeviceByName };
