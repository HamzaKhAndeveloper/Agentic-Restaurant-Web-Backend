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
const allowedOrigins = [
  "https://agentic-restaurant-web-front.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors());

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
