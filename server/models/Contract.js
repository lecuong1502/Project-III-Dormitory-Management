const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
    {
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        room_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        bed_id: {
            type: mongoose.Schema.Types.ObjectId, // embedded bed _id inside Room
            required: true,
        },
        start_date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        end_date: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'terminated'],
            default: 'active',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Contract', contractSchema);
