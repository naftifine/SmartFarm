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

async function createDevice (newDevice) {
    try {
        const db = getDB();

        // Kiểm tra xem Channel đã tồn tại chưa
        const existingDevice = await db
            .collection('devices')
            .findOne({ channel: newDevice.channel });
        if (existingDevice) {
            throw new Error(`Channel "${newDevice.channel}" đã tồn tại trong devices`);
        }
        const existingButton = await db
            .collection('buttons')
            .findOne({ channel: newDevice.channel });
        if (existingButton) {
            throw new Error(`Channel "${newDevice.channel}" đã tồn tại trong buttons`);
        }

        newDevice.value = newDevice.lower_threshold;
        newDevice.create_epoch = Date.now();
        newDevice.expiration_epoch = Date.now() + 6000000;

        const device = await db.collection('devices').insertOne(newDevice);
        return device;
    } catch (err) {
        throw new Error('Error creating device: ' + err.message);
    } 
}

module.exports = { getAllDevices, getDeviceByName, createDevice };
