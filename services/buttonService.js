const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const getAllButtons = async () => {
    try {
        const db = getDB();
        const buttons = await db.collection('buttons').find().toArray();
        return buttons;
    } catch (error) {
        throw new Error('Error fetching: ' + error.message);
    }
};

const getButtonByName = async (name) => {
    try {
        const db = getDB();
        const button = await db.collection('buttons').findOne({
            button: { $regex: `^${name}$` }
        });
        return button;
    } catch (error) {
        throw new Error('Error fetching: ' + error.message);
    }
}

const createButton = async (newButton) => {
    try {
        const db = getDB();

        // Kiểm tra xem Channel đã tồn tại chưa
        const existingDevice = await db
            .collection('devices')
            .findOne({ channel: newButton.channel });
        if (existingDevice) {
            throw new Error(`Channel "${newButton.channel}" đã tồn tại trong devices`);
        }
        const existingButton = await db
            .collection('buttons')
            .findOne({ channel: newButton.channel });
        if (existingButton) {
            throw new Error(`Channel "${newButton.channel}" đã tồn tại trong buttons`);
        }

        newButton.status = "Off"
        const button = await db.collection('buttons').insertOne(newButton);
        return button;
    } catch (err) {
        throw new Error('Error creating button: ' + err.message);
    }
}

const updateButtonStatus = async (name, newStatus) => {
    try {
        const db = getDB();
        const timestamp = Math.floor(Date.now() / 1000);

        const button = await db.collection('buttons').findOne({ 
            button: { $regex: `^${name}$` }
        });
        if (!button) {
            throw new Error(`Button "${name}" not found.`);
        }

        if (button.status === newStatus) {
            return button;
        }

        const updateResult = await db.collection('buttons').updateOne(
            { button: name },
            {
                $set: { status: newStatus },
                $push: { log: { timestamp, status: newStatus } }
            }
        );

        if (updateResult.modifiedCount === 0) {
            throw new Error('Update failed.');
        }

        return await db.collection('buttons').findOne({ button: name });
    } catch (error) {
        throw new Error('Error updating: ' + error.message);
    }
};

const deleteButtonById = async (buttonId) => {
    try {
        const db = getDB();
        const result = await db.collection('buttons').deleteOne({ _id: new ObjectId(buttonId) });
        return result.deletedCount > 0
        
    } catch (error) {
        console.error('Error deleting button:', error.message);
    }
};

module.exports = { getAllButtons, getButtonByName, createButton, updateButtonStatus, deleteButtonById };