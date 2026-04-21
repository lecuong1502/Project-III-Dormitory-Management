const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const accountSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, // never returned in queries by default
        },
        role: {
            type: String,
            enum: ['student', 'admin'],
            default: 'student',
        },
        status: {
            type: String,
            enum: ['active', 'locked'],
            default: 'active',
        },
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            default: null,
        },
    },
    { timestamps: true }
);

// Hash password before saving
accountSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
accountSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Account', accountSchema);
