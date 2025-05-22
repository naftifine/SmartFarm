const express = require('express');
const router = express.Router();
const { getAllNotifications, getUnreadNotifications , markAllAsRead, deleteNotificationById } = require('../controllers/notificationController');

router.get('/', getAllNotifications);
router.get('/unread', getUnreadNotifications);
router.put('/', markAllAsRead);
router.delete('/:notificationId', deleteNotificationById);

module.exports = router;