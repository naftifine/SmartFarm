const express = require('express');
const router = express.Router();
const { getAllButtons, getButtonByName, createButton, updateButton } = require('../controllers/buttonController');

router.get('/', getAllButtons);
router.post('/find', getButtonByName)
router.post('/', createButton)
router.put('/', updateButton);

module.exports = router;
