// backend/services/authService.js
const User = require('../models/User');
const UserWord = require('../models/UserWord');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async ({ username, email, password }) => {
    let user = await User.findOne({ email });
    if (user) throw new Error('Email này đã được sử dụng');
    
    user = await User.findOne({ username });
    if (user) throw new Error('Username này đã được sử dụng');

    user = new User({ username, email, password });
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email hoặc mật khẩu không chính xác');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Email hoặc mật khẩu không chính xác');

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    return token;
};

const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('Không tìm thấy người dùng');
    
    const learnedWordsCount = await UserWord.countDocuments({ user: userId });
    return { ...user.toObject(), learnedWordsCount };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Mật khẩu hiện tại không đúng');

    user.password = newPassword;
    await user.save();
    return true;
};

const updateProfile = async (userId, newUsername) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');

    if (user.username === newUsername) return user;

    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) throw new Error('Username này đã được sử dụng');

    user.username = newUsername;
    await user.save();
    return user;
};

const updateAvatar = async (userId, filename) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');
    user.avatarUrl = filename;
    await user.save();
    return user.avatarUrl;
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    changePassword,
    updateProfile,
    updateAvatar
};