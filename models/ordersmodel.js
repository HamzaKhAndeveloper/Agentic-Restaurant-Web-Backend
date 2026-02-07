const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: String,
    items: Array,
    total: Number,
    status: String,
    usernumber: String,
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
