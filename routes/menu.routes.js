const express = require('express');
const router = express.Router();
const Menu = require('../models/menumodel');

router.get('/menu', async (req, res) => {
    try {
        const menuItems = await Menu.find();
        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;