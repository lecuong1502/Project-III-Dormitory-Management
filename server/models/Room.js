const mongoose = require('mongoose');

// Embedded Bed schema (Composition pattern as per class diagram)
const bedSchema = new mongoose.Schema({
    bed_number: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available',
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null,
    },
});

const roomSchema = new mongoose.Schema(
    {
        room_number: {
            type: String,
            required: [true, 'Room number is required'],
            trim: true,
        },
        building_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Building',
            required: true,
        },
        room_type: {
            type: String,
            enum: ['4-person', '6-person', '8-person'],
            required: true,
        },
        status: {
            type: String,
            enum: ['available', 'full', 'maintenance'],
            default: 'available',
        },
        price_per_month: {
            type: Number,
            required: true,
        },
        // Embedded beds array (Composition)
        beds: [bedSchema],
    },
    { timestamps: true }
);

// Virtual: count available beds
roomSchema.virtual('available_beds_count').get(function () {
    return this.beds.filter((b) => b.status === 'available').length;
});

// Auto-update room status based on beds
roomSchema.methods.updateRoomStatus = function () {
    const available = this.beds.filter((b) => b.status === 'available').length;
    if (available === 0) this.status = 'full';
    else this.status = 'available';
};

module.exports = mongoose.model('Room', roomSchema);
