const scheduleService = require('../services/scheduleService');

const createSchedule = async (req, res) => {
    try {
        const schedule = await scheduleService.createSchedule(req.body);
        res.status(201).json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const updateSchedule = async (req, res) => {
    const { scheduleId } = req.params;
    try {
        const schedule = await scheduleService.updateSchedule(scheduleId, req.body);
        res.status(201).json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getScheduleByButtonId = async (req, res) => {
    const {buttonId} = req.params;
    try {
        const schedule = await scheduleService.getScheduleByButtonId(buttonId);
        res.status(201).json(schedule);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { createSchedule, updateSchedule, getScheduleByButtonId };
