const buttonService = require('../services/buttonService');

const getAllButtons = async (req, res) => {
    try {
        const buttons = await buttonService.getAllButtons();
        res.json(buttons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getButtonByName = async (req, res) => {
    try {   
        const button = await buttonService.getButtonByName(req.body.button);
        if (!button) 
            return res.status(404).json({ message: 'Button not found' });
        res.json(button);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const createButton = async (req, res) => {
    try {
        const button = await buttonService.createButton(req.body);
        res.status(201).json(button);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const updateButton = async (req, res) => {
    const { button, status } = req.body;

    if (!['on', 'off'].includes(status)) {
        return res.status(400).json({ message: "Invalid status, must be 'on' or 'off'." });
    }

    try {
        const updatedButton = await buttonService.updateButtonStatus(button, status);
        res.json(updatedButton);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllButtons, getButtonByName, createButton, updateButton };
