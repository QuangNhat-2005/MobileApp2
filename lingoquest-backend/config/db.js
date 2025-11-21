// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Đã kết nối tới MongoDB thành công!');
    } catch (err) {
        console.error('❌ Kết nối MongoDB thất bại:', err.message);
        process.exit(1); // Dừng app nếu không kết nối được DB
    }
};

module.exports = connectDB;