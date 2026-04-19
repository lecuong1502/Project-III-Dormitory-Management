const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
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
        month: {
            type: String, // Format: "YYYY-MM", e.g. "2026-03"
            required: true,
        },
        room_fee: {
            type: Number,
            required: true,
        },
        electricity_fee: {
            type: Number,
            default: 0,
            },
        water_fee: {
            type: Number,
            default: 0,
            },
        service_fee: {
            type: Number,
            default: 0,
        },
        total_amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['unpaid', 'pending_verification', 'paid'],
            default: 'unpaid',
        },
        // Proof of payment uploaded by student
        payment_proof_url: {
            type: String,
            default: null,
        },
        paid_at: {
            type: Date,
            default: null,
        },
        confirmed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null,
        },
        rejection_reason: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);