const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const User = require('../models/usermodel');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashed });

    res.json({ success: true });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ token, user: {
            username: user.username,
            email: user.email,
            id: user._id
        },success: true });
});

module.exports = router;
