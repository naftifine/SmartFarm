const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

async function checkForConflict(schedule, excludeId = null) {
    const db = getDB();
    const newStart = timeToMinutes(schedule.start_time);
    const newEnd = timeToMinutes(schedule.end_time);

    const query = {
        is_recurring: true,
        days_of_week: { $in: schedule.days_of_week },
    };

    if (excludeId) {
        query._id = { $ne: new ObjectId(excludeId) };
    }

    const existingSchedules = await db.collection('schedule').find(query).toArray();

    for (const existing of existingSchedules) {
        const existStart = timeToMinutes(existing.start_time);
        const existEnd = timeToMinutes(existing.end_time);

        if (
            (newStart < existEnd && newEnd > existStart)
        ) {
            throw new Error(`Schedule overlaps with existing recurring schedule on days: ${existing.days_of_week.join(', ')}`);
        }
    }
}

const createSchedule = async (newSchedule) => {
    try {
        await checkForConflict(newSchedule);
        const db = getDB();
        const schedule = await db.collection('schedule').insertOne(newSchedule);
        return schedule;
    } catch (err) {
        throw new Error('Error creating schedule: ' + err.message);
    }
}

const updateSchedule = async (scheduleId, newSchedule) => {
    try {
        await checkForConflict(newSchedule, scheduleId);
        const db = getDB();
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
        if (!bnt) {
            throw new Error('Button not found');
        }

        const sch = await db.collection('schedule').find({ channel: bnt.channel }).toArray();

        return sch;
    } catch (err) {
        throw new Error('Error fetching: ' + err.message);
    }
};

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