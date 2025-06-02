const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const getAllNotifications = async () => {
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

const deleteNotificationById = async (notificationId) => {
    try {
        const db = getDB();
        const result = await db.collection('notifications').deleteOne({ _id: new ObjectId(notificationId) });
        return result.deletedCount > 0
    } catch (error) {
        console.error('Error deleting notification:', error.message);
    }
};

module.exports = { getAllNotifications, getUnreadNotifications, markAllAsRead, deleteNotificationById };