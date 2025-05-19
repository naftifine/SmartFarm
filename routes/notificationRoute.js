const express = require('express');
const router = express.Router();
const { getAllNotifications, getUnreadNotifications , markAllAsRead } = require('../controllers/notificationController');

router.get('/', getAllNotifications);
router.get('/unread', getUnreadNotifications);
router.put('/', markAllAsRead);

module.exports = router;