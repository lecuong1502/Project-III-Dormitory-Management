const mongoose = require('mongoose');

const electricityWaterSchema = new mongoose.Schema(
    {
        room_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        month: {
            type: String, // Format: "YYYY-MM", e.g. "2026-03"
            required: true,
        },
        electricity_prev: { type: Number, default: 0 }, // kWh reading previous month
        electricity_curr: { type: Number, default: 0 }, // kWh reading this month
        water_prev: { type: Number, default: 0 },        // m³ reading previous month
        water_curr: { type: Number, default: 0 },        // m³ reading this month
        electricity_unit_price: { type: Number, default: 3500 }, // VND per kWh
        water_unit_price: { type: Number, default: 15000 },      // VND per m³
        recorded_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
        },
    },
    { timestamps: true }
);

// Virtual: calculate total electricity cost
electricityWaterSchema.virtual('electricity_cost').get(function () {
    return (this.electricity_curr - this.electricity_prev) * this.electricity_unit_price;
});

// Virtual: calculate total water cost
electricityWaterSchema.virtual('water_cost').get(function () {
    return (this.water_curr - this.water_prev) * this.water_unit_price;
});

module.exports = mongoose.model('ElectricityWater', electricityWaterSchema);