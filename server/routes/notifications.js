const express = require('express');
const router = express.Router();
const {
    getMyNotifications, getAllNotifications, sendNotification,
    markAsRead, markAllAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

router.get('/', protect, roleMiddleware('admin'), getAllNotifications);
router.post('/', protect, roleMiddleware('admin'), sendNotification);
router.get('/my', protect, roleMiddleware('student'), getMyNotifications);
router.patch('/mark-all-read', protect, roleMiddleware('student'), markAllAsRead);
router.patch('/:id/read', protect, markAsRead);

module.exports = router;
