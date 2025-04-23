const express = require('express');
const router = express.Router();
const { createSchedule, updateSchedule } = require('../controllers/scheduleController');

router.post('/', createSchedule)
router.put('/:scheduleId', updateSchedule)

module.exports = router;
