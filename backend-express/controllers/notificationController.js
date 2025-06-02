const notificationService = require('../services/notificationService');

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getAllNotifications();
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUnreadNotifications = async (req, res) => {
    try {
        const unreadNotifs = await notificationService.getUnreadNotifications();
        res.json(unreadNotifs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const result = await notificationService.markAllAsRead();
        res.json({
            message: 'Tất cả thông báo đã được đánh dấu là đã đọc.',
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteNotificationById = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const result = await notificationService.deleteNotificationById(notificationId);
        if (!result) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { getAllNotifications, getUnreadNotifications, markAllAsRead, deleteNotificationById };
