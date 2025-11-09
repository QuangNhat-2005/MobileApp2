const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); 

const app = express();

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, x-auth-token'
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Đã kết nối tới MongoDB thành công!'))
    .catch(err => console.error('Kết nối MongoDB thất bại:', err));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/words', require('./routes/words'));
app.use('/api/decks', require('./routes/decks'));
app.use('/api/lesson', require('./routes/lesson'));
app.use('/api/arena', require('./routes/arena'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/debug', require('./routes/debug'));
app.use('/api/review', require('./routes/review'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang lắng nghe trên cổng ${PORT}`));