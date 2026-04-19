const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
    {
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        category: {
            type: String,
            enum: ['maintenance', 'room_transfer', 'checkout', 'other'],
            required: [true, 'Request category is required'],
        },
        content: {
            type: String,
            required: [true, 'Request content is required'],
            trim: true,
        },
        attachment_url: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ['new', 'processing', 'completed', 'rejected'],
            default: 'new',
        },
        admin_response: {
            type: String,
            default: null,
        },
        processed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null,
        },
        resolved_at: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);