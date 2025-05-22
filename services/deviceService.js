const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

async function getAllDevices() {
    try {
        const db = getDB();
        const devices = await db.collection('devices').find().toArray();
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

const updateDevice = async (deviceId, newDevice) => {
    try {
        const db = getDB();
        const dev = await db.collection('devices').findOne({ _id: new ObjectId(deviceId) });
        const result = await db.collection('devices').updateOne(
            { _id: new ObjectId(deviceId) },
            { $set: newDevice }
        );
        return result;
    } catch (err) {
        throw new Error('Error updating schedule: ' + err.message);
    }
}

const deleteDeviceById = async (deviceId) => {
    try {
        const db = getDB();
        const result = await db.collection('devices').deleteOne({ _id: new ObjectId(deviceId) });
        return result.deletedCount > 0
    } catch (error) {
        console.error('Error deleting device:', error.message);
    }
};

module.exports = { getAllDevices, getDeviceByName, createDevice, updateDevice, deleteDeviceById };
