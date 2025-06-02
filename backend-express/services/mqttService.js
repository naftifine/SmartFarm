const mqtt = require('mqtt');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const moment = require('moment');

// Khởi tạo MQTT client
const mqttClient = mqtt.connect('mqtt://mqtt.ohstem.vn', {
    username: 'howToUse'
});

// Khi kết nối thành công: subscribe tất cả channel từ các collection
const onConnect = async () => {
    console.log('Connected to MQTT Broker');
    try {
        const db = getDB();
        const [devices, buttons] = await Promise.all([
            db.collection('devices').find().toArray(),
            db.collection('buttons').find().toArray()
        ]);

        const channels = new Set([
            ...devices.map(d => d.channel).filter(Boolean),
            ...buttons.map(b => b.channel).filter(Boolean)
        ]);

        for (const channel of channels) {
            mqttClient.subscribe(channel, err => {
                if (err) {
                    console.error(`Error subscribing to ${channel}:`, err);
                } else {
                    console.log(`Subscribed to channel: ${channel}`);
                }
            });
        }
    } catch (err) {
        console.error('Error fetching devices/buttons:', err);
    }
    mqttClient.on('message', (topic, msg) => {
        handleMessage(topic, msg);
    });
};

// Xử lý message nhận được
const handleMessage = async (topic, message) => {
    try {
        const msgStr = message.toString();
        console.log(`Received message on topic ${topic}: ${msgStr}`);

        const db = getDB();

        // --- Button logic ---
        const button = await db.collection('buttons').findOne({ channel: topic });
        if (button) {
            console.log(`Found button for channel ${topic}: ${button.name}, current status: ${button.status}`);

            const status = msgStr === '1' ? 'On' : msgStr === '0' ? 'Off' : 'Unknown';
            console.log(`Determined status from message: ${status}`);

            const lastLog = (button.log || []).slice(-1)[0];
            if (!lastLog || lastLog.status !== status) {
                console.log(`Updating button ${button.name} status to ${status}`);

                await db.collection('buttons').updateOne(
                    { _id: button._id },
                    {
                        $set: { status },
                        $push: { log: { status, timestamp: Date.now() } }
                    }
                );
                console.log(`Button ${button.name} (${topic}) status updated to ${status}`);
            } else {
                console.log(`Button ${button.name} status already ${status}, no update needed`);
            }
            return;
        } else {
            console.log(`No button found for channel ${topic}`);
        }

        // --- Device logic ---
        const device = await db.collection('devices').findOne({ channel: topic });
        if (device) {
            const sensorValue = parseFloat(msgStr);
            const alarmBtn = await db
                .collection('buttons')
                .findOne({ channel: device.button_channel });

            const publish = (btnChannel, payload) => {
                mqttClient.publish(btnChannel, payload, { qos: 2, retain: true }, err => {
                    if (err) console.error(`Publish error to ${btnChannel}:`, err);
                    else console.log(`Published ${payload} to ${btnChannel}`);
                });
            };
            // Điều khiển alarm button
            if (alarmBtn) {
                const shouldOn =
                    (['Cảm biến nhiệt độ', 'Cảm biến độ ẩm không khí'].includes(device.name) &&
                        sensorValue > device.upper_threshold) ||
                    (['Cảm biến ánh sáng', 'Cảm biến độ ẩm đất'].includes(device.name) &&
                        sensorValue < device.lower_threshold);
                const shouldOff =
                    (['Cảm biến nhiệt độ', 'Cảm biến độ ẩm không khí'].includes(device.name) &&
                        sensorValue < device.lower_threshold) ||
                    (['Cảm biến ánh sáng', 'Cảm biến độ ẩm đất'].includes(device.name) &&
                        sensorValue > device.upper_threshold);

                if (shouldOn && alarmBtn.status !== 'On') {
                    publish(alarmBtn.channel, '1');
                    // THÊM THÔNG BÁO nếu bật cảnh báo
                    await db.collection('notifications').insertOne({
                        message: `⚠️ ${device.name} cho giá trị ngoài ngưỡng an toàn, đã tự động bật thiết bị ${alarmBtn.name}`,
                        createdAt: new Date(),
                        isRead: false
                    });
                }
                else if (shouldOff && alarmBtn.status !== 'Off') {
                    publish(alarmBtn.channel, '0');

                    // THÊM THÔNG BÁO nếu bật cảnh báo
                    await db.collection('notifications').insertOne({
                        message: `⚠️ ${device.name} cho giá trị trong ngưỡng an toàn, đã tự động tắt thiết bị ${alarmBtn.name}`,
                        createdAt: new Date(),
                        isRead: false
                    });
                }
            }

            // Lưu log sensor
            await db.collection('devices').updateOne(
                { _id: device._id },
                {
                    $set: { value: sensorValue },
                    $push: { logs: { timestamp: Date.now(), value: sensorValue } }
                }
            );
            console.log(`Sensor ${device.name} saved value ${sensorValue}`);
        }
    } catch (err) {
        console.error('Error processing MQTT message:', err);
    }
};

// Kiểm tra lịch và bật/tắt theo schedule
const checkButtonSchedule = async () => {
    const now = moment();
    const currentTime = now.format('HH:mm');
    const currentDay = now.format('dddd');
    try {
        const db = getDB();
        const schedules = await db.collection('schedule').find({
            days_of_week: currentDay,
            is_recurring: true,
            start_time: { $lte: currentTime },
            end_time: { $gte: currentTime }
        }).toArray();
        for (const sched of schedules) {
            const button = await db.collection('buttons').findOne({ channel: sched.channel });
            if (!button) continue;

            const endBuffer = moment(sched.end_time, 'HH:mm').add(10, 'seconds').format('HH:mm');

            if (currentTime < sched.end_time && button.status !== 'On') {
                mqttClient.publish(sched.channel, '1', { qos: 2, retain: true }, err => {
                    if (err) console.error(err);
                    else console.log(`Scheduled ON ${sched.channel} at ${currentTime}`);
                });
            } else if (currentTime >= sched.end_time && currentTime <= endBuffer && button.status !== 'Off') {
                mqttClient.publish(sched.channel, '0', { qos: 2, retain: true }, err => {
                    if (err) console.error(err);
                    else console.log(`Scheduled OFF ${sched.channel} at ${currentTime}`);
                });
            }
        }
    } catch (err) {
        console.error('Error checking schedule:', err);
    }
};

const controlButtonById = async (buttonId, status) => {
    console.log(`controlButtonById called with buttonId: ${buttonId}, status: ${status}`);

    const db = getDB();
    const btn = await db.collection('buttons').findOne({ _id: new ObjectId(buttonId) });

    if (!btn) {
        console.error(`Button with ID ${buttonId} does not exist`);
        throw new Error('Button does not exist');
    }

    console.log(`Found button: ${btn.name}, current status: ${btn.status}, channel: ${btn.channel}`);

    // Case-insensitive status comparison
    if (btn.status.toLowerCase() === status.toLowerCase()) {
        console.log(`Button ${btn.name} already has status: ${status}`);
        throw new Error(`${btn.name} already has status: ${status}`);
    }

    // Handle both uppercase and lowercase status values
    const payload = (status.toLowerCase() === 'on' || status === '1') ? '1' : '0';
    console.log(`Publishing payload: ${payload} to channel: ${btn.channel}`);

    mqttClient.publish(btn.channel, payload, { qos: 2, retain: true }, err => {
        if (err) {
            console.error(`Error publishing to channel ${btn.channel}:`, err);
        } else {
            console.log(`Successfully published ${payload} to channel ${btn.channel}`);
        }
    });

    // Update button status in database
    await db.collection('buttons').updateOne(
        { _id: btn._id },
        {
            $set: { status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() },
            $push: { log: { status, timestamp: Date.now() } }
        }
    );

    console.log(`Button ${btn.name} status updated in database`);
    return `Successfully controlled button ${btn.name}`;
};

// Khởi động service
const startMqttService = () => {
    const mqttClient = mqtt.connect('mqtt://mqtt.ohstem.vn', {
        username: 'howToUse'
    });
    mqttClient.on('connect', onConnect);
    setInterval(checkButtonSchedule, 5000);
};

module.exports = { startMqttService, controlButtonById };