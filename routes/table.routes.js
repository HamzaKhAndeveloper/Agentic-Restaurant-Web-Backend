const express = require('express');
const router = express.Router();
const Table = require('../models/tablemodel');

router.get('/tables', async (req, res) => {
    res.json(await Table.find())
});
module.exports = router;