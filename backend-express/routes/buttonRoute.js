const express = require('express');
const router = express.Router();
const { getAllButtons, getButtonByName, createButton, updateButton, deleteButtonById } = require('../controllers/buttonController');

router.get('/', getAllButtons);
router.post('/find', getButtonByName)
router.post('/', createButton)
router.put('/', updateButton);
router.delete('/:buttonId', deleteButtonById);

module.exports = router;
