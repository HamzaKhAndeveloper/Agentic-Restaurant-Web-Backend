const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    userId: String,
    number: Number,
    seats: Number,
    isAvailable: {
        type: Boolean,
        default: true
    },
    bookingStart: {
        type: Date,
        default: null
    },
    bookingEnd: {
        type: Date,
        default: null
    },
    bookedHours: {
        type: Number,
        min: 1,
        max: 3
    }
});

const Table = mongoose.models.Table || mongoose.model('Table', tableSchema);

module.exports = Table;