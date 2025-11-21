// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db'); // Import file db vừa sửa

const app = express();

// 1. Kết nối Database
connectDB();

// 2. Middleware
app.use(cors({
    origin: '*', // Sau này nên đổi thành domain cụ thể để bảo mật hơn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, x-auth-token'
}));
app.use(express.json());

// 3. Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/words', require('./routes/words'));
app.use('/api/decks', require('./routes/decks'));
app.use('/api/lesson', require('./routes/lesson'));
app.use('/api/arena', require('./routes/arena'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/debug', require('./routes/debug'));
app.use('/api/review', require('./routes/review'));

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang lắng nghe trên cổng ${PORT}`));