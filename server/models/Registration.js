const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
    {
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        desired_room_type: {
            type: String,
            enum: ['4-person', '6-person', '8-person'],
            required: true,
        },
        desired_building: {
            type: String,
            trim: true,
        },
        content: {
            type: String, // additional notes from student
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        rejection_reason: {
            type: String,
            default: null,
        },
        // Filled by admin upon approval
        assigned_room_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            default: null,
        },
        assigned_bed_id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        reviewed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null,
        },
        reviewed_at: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);