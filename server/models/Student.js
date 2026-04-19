const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
    {
        student_code: {
            type: String,
            required: [true, 'Student code (MSSV) is required'],
            unique: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        date_of_birth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
        },
        phone: {
            type: String,
            trim: true,
        },
        // Reference to current active contract (null if not residing)
        current_contract: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contract',
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);