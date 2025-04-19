const express = require('express');
const router = express.Router();
const { getAllButtons, getButtonByName, updateButton } = require('../controllers/buttonController');

router.get('/', getAllButtons);
router.post('/find', getButtonByName)
router.put('/', updateButton);

module.exports = router;
