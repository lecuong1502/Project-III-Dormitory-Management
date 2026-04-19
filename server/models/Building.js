const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Building name is required'],
            unique: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        total_rooms: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Building', buildingSchema);