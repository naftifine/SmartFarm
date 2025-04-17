const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./db');
const deviceRoutes = require('./routes/DevicesRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/device', deviceRoutes);

async function startServer() {
    await connectDB('SmartFarm');
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

startServer();
