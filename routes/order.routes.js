const express = require('express');
const router = express.Router();
const Order = require('../models/ordersmodel');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/orders', authMiddleware, async (req, res) => {
    try {
        const order = await Order.create({
            userId: req.user.userId,
            items: req.body.items,
            total: req.body.total,
            status: 'pending',
            usernumber: req.body.usernumber,
        });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all orders
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.user.userId
        }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;