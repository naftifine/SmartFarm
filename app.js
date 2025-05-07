const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const deviceRoutes = require('./routes/deviceRoute');
const buttonRoutes = require('./routes/buttonRoute');
const scheduleRoutes = require('./routes/scheduleRoute')
const mqttRoutes = require('./routes/mqttRoute')
const authRoutes = require('./routes/authRoute');
const { startMqttService } = require('./services/mqttService');;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/device', deviceRoutes);
app.use('/button', buttonRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/mqtt', mqttRoutes);
app.use('/auth', authRoutes);

async function startServer() {
    await connectDB('SmartFarm');
    app.listen(PORT, () => {
        startMqttService();
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

startServer();
