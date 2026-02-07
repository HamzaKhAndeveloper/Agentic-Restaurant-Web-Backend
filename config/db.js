const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.Mongo_Url);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Mongo Error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
