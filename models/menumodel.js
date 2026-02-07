const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    image: String,
    description: String
});

const Menu = mongoose.models.Menu || mongoose.model('Menu', menuSchema);

module.exports = Menu;