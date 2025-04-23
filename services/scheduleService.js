const { getDB } = require('../config/db');

const createSchedule = async (newSchedule) => {
    try {
        const db = getDB();
        const schedule = await db.collection('schedule').insertOne(newSchedule);
        return schedule;
    } catch (err) {
        throw new Error('Error creating schedule: ' + err.message);
    }
}

const updateSchedule = async (newSchedule) => {
    try {
        const db = getDB();
        const schedule = await db.collection('schedule').updateOne(newSchedule)
        return schedule;
    } catch (err) {
        throw new Error('Error creating schedule: ' + err.message);
    }
}

module.exports = { createSchedule, updateSchedule };