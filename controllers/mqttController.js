const mqttService = require('../services/mqttService');

const controlButton = async (req, res) => {
    try {
        const { buttonId } = req.params;
        const { status } = req.body;
        result = await mqttService.controlButtonById(buttonId, status);
        res.status(201).json({ message: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { controlButton };
