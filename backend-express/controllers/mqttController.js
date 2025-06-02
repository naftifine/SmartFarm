const mqttService = require('../services/mqttService');

const controlButton = async (req, res) => {
    console.log('MQTT controller: controlButton called');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);

    try {
        const { buttonId } = req.params;
        const { status } = req.body;

        console.log(`Controlling button ${buttonId} with status ${status}`);

        const result = await mqttService.controlButtonById(buttonId, status);

        console.log(`Control button result: ${result}`);

        res.status(201).json({ message: result });
    } catch (err) {
        console.error('Error in controlButton:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { controlButton };
