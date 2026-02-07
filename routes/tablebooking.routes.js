
const express = require('express');
const router = express.Router();
const Table = require('../models/tablemodel');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/tables/book', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { tableId, hours } = req.body;

        // validation
        if (!tableId || !hours) {
            return res.status(400).json({ error: "Missing data" });
        }

        if (hours < 1 || hours > 3) {
            return res.status(400).json({ error: "Sirf 1 se 3 hours tak allowed hain" });
        }

        const table = await Table.findById(tableId);

        if (!table) {
            return res.status(404).json({ error: "Table not found" });
        }

        // already booked
        if (!table.isAvailable) {
            return res.status(400).json({ error: "Table already booked" });
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

        table.userId = userId;
        table.isAvailable = false;
        table.bookingStart = startTime;
        table.bookingEnd = endTime;
        table.bookedHours = hours;

        await table.save();

        res.json({
            success: true,
            message: "Table booked successfully",
            table
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;