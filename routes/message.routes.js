const express = require('express');
const router = express.Router();
const Message = require('../models/messagemodel');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/messages/:userid', authMiddleware, async (req, res) => {
    try {
        const { userid } = req.params;

        if (req.user.userId !== userid.toString())
            return res.status(403).json({ success: false, error: "Access denied" });

        const messages = await Message.find({ userid }).sort({ timestamp: 1 });
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;