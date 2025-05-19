const express = require('express');
const router = express.Router();
const { createSchedule, updateSchedule, getScheduleByButtonId } = require('../controllers/scheduleController');

router.post('/', createSchedule)
router.put('/:scheduleId', updateSchedule)
router.get('/:buttonId', getScheduleByButtonId)

module.exports = router;
