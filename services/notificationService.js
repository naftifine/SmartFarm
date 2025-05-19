const { getDB } = require('../config/db');

const getAllNotification = async () => {
    try {
        const db = getDB();
        const notifications = await db.collection('notifications').find().toArray();
        return notifications;
    } catch (error) {
        throw new Error('Error fetching: ' + error.message);
    }
};

const getUnreadNotifications = async () => {
    try {
        const db = getDB();
        const unreadNotifs = await db.collection('notifications').find({ isRead: false }).toArray();
        return unreadNotifs;
    } catch (error) {
        throw new Error('Error fetching: ' + error.message);
    }
};

const markAllAsRead = async () => {
    try {
        const db = getDB();
        const result = await db.collection('notifications').updateMany(
            { isRead: false },
            { $set: { isRead: true } }
        );
        return result;
    } catch (error) {
        throw new Error('Error: ' + error.message);
    }
};

module.exports = { getAllNotification, getUnreadNotifications, markAllAsRead };