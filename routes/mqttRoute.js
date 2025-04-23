const express = require('express');
const router = express.Router();
const { controlButton } = require('../controllers/mqttController');

router.post('/:buttonId', controlButton)

module.exports = router;
