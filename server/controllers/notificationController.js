const Notification = require('../models/Notification');
const Student = require('../models/Student');

// ─── @route   GET /api/notifications/my ──────────────────────
// ─── @access  Private (Student)
const getMyNotifications = async (req, res) => {
    try {
        const student = await Student.findById(req.user.student_id);
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

        // Fetch both broadcast (student_id: null) and personal notifications
        const notifications = await Notification.find({
            $or: [{ student_id: student._id }, { student_id: null }],
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   GET /api/notifications ─────────────────────────
// ─── @access  Private (Admin)
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('student_id', 'fullname student_code')
            .populate('created_by', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   POST /api/notifications ────────────────────────
// ─── @access  Private (Admin)
const sendNotification = async (req, res) => {
    try {
        const { title, content, student_id } = req.body; // student_id = null for broadcast

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required.' });
        }

        let notification;

        // Broadcast to all students
        if (!student_id) {
            notification = await Notification.create({
                title,
                content,
                student_id: null,
                created_by: req.user._id,
            });
            return res.status(201).json({ success: true, message: 'Broadcast notification sent to all students.', data: notification });
        }

        // Personal notification
        const student = await Student.findById(student_id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

        notification = await Notification.create({
            title,
            content,
            student_id: student._id,
            created_by: req.user._id,
        });

        res.status(201).json({ success: true, message: 'Notification sent to student.', data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   PATCH /api/notifications/:id/read ──────────────
// ─── @access  Private (Student)
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { is_read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── @route   PATCH /api/notifications/mark-all-read ─────────
// ─── @access  Private (Student)
const markAllAsRead = async (req, res) => {
    try {
        const student = await Student.findById(req.user.student_id);
        if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

        await Notification.updateMany(
            { $or: [{ student_id: student._id }, { student_id: null }], is_read: false },
            { is_read: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMyNotifications, getAllNotifications, sendNotification, markAsRead, markAllAsRead };