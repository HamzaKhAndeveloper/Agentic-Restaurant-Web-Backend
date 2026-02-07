const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

// routes
const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
const menuRoutes = require('./routes/menu.routes');
const tableRoutes = require('./routes/table.routes');
const orderRoutes = require('./routes/order.routes');
const messageRoutes = require('./routes/message.routes');
const tablebookingRoutes = require('./routes/tablebooking.routes');

// cron
require('./cron/tableRelease.cron');

const app = express();

// DB
connectDB();

// middleware
app.use(cors({
    origin: "https://agentic-restaurant-web-front.vercel.app",
    credentials: true
}));
app.options("*", cors({
    origin: "https://agentic-restaurant-web-front.vercel.app",
    credentials: true
}));

app.use(express.json());

// routes
app.use('/api', authRoutes);
app.use('/api', aiRoutes);
app.use('/api', menuRoutes);
app.use('/api', tablebookingRoutes);
app.use('/api', tableRoutes);
app.use('/api', orderRoutes);
app.use('/api', messageRoutes);

module.exports = app;
