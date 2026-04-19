const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Notification title is required'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Notification content is required'],
        },
        // null = broadcast to all students; specific ObjectId = personal notification
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            default: null,
        },
        is_read: {
            type: Boolean,
            default: false,
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);