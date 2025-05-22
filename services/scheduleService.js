const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const createSchedule = async (newSchedule) => {
    try {
        const db = getDB();
        const schedule = await db.collection('schedule').insertOne(newSchedule);
        return schedule;
    } catch (err) {
        throw new Error('Error creating schedule: ' + err.message);
    }
}

const updateSchedule = async (scheduleId, newSchedule) => {
    try {
        const db = getDB();
        const sch = await db.collection('schedule').findOne({ _id: new ObjectId(scheduleId) });
        const result = await db.collection('schedule').updateOne(
            { _id: new ObjectId(scheduleId) },
            { $set: newSchedule }
        );
        return result;
    } catch (err) {
        throw new Error('Error updating schedule: ' + err.message);
    }
}

const getScheduleByButtonId = async (buttonId) => {
    try {
        const db = getDB();
        const bnt = await db.collection('buttons').findOne({ _id: new ObjectId(buttonId) });
        const  sch = await db.collection('schedule').findOne({ channel: bnt.channel });
        return sch;
    } catch (err) {
        throw new Error('Error fetching: ' + err.message);
    }
}

const deleteScheduleById = async (scheduleId) => {
    try {
        const db = getDB();
        const result = await db.collection('schedule').deleteOne({ _id: new ObjectId(scheduleId) });
        return result.deletedCount > 0
    } catch (error) {
        console.error('Error deleting schedule:', error.message);
    }
};

module.exports = { createSchedule, updateSchedule, getScheduleByButtonId, deleteScheduleById};