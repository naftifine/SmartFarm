const express = require('express');
const router = express.Router();
const { createSchedule, updateSchedule, getScheduleByButtonId, deleteScheduleById } = require('../controllers/scheduleController');

router.post('/', createSchedule)
router.put('/:scheduleId', updateSchedule)
router.get('/:buttonId', getScheduleByButtonId)
router.delete('/:scheduleId', deleteScheduleById)

module.exports = router;
