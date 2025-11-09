const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserWord = require('../models/UserWord');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto'); 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const randomName = crypto.randomBytes(16).toString('hex');
        const extension = path.extname(file.originalname);
        cb(null, randomName + extension);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: Chỉ hỗ trợ upload file ảnh (jpeg, jpg, png, gif)!");
    }
});
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'Email này đã được sử dụng' });
        user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'Username này đã được sử dụng' });
        user = new User({ username, email, password });
        await user.save();
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token });
        });
    } catch (err) {
        console.error('LỖI TRONG ROUTE REGISTER:', err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Email hoặc mật khẩu không chính xác' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Email hoặc mật khẩu không chính xác' });
        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('LỖI TRONG ROUTE LOGIN:', err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        const learnedWordsCount = await UserWord.countDocuments({ user: req.user.id });
        const userProfile = user.toObject();
        userProfile.learnedWordsCount = learnedWordsCount;
        res.json(userProfile);
    } catch (err) {
        console.error('LỖI TRONG ROUTE /ME:', err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

router.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ msg: 'Vui lòng điền đầy đủ thông tin' });
    if (newPassword.length < 6) return res.status(400).json({ msg: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Mật khẩu hiện tại không đúng' });
        user.password = newPassword;
        await user.save();
        res.json({ msg: 'Đổi mật khẩu thành công' });
    } catch (err) {
        console.error('LỖI TRONG ROUTE CHANGE-PASSWORD:', err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

router.put('/profile', auth, async (req, res) => {
    const { username } = req.body;
    if (!username || username.trim().length < 3) {
        return res.status(400).json({ msg: 'Username phải có ít nhất 3 ký tự' });
    }
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        if (user.username === username) return res.json({ msg: 'Username không thay đổi', user });
        const existingUser = await User.findOne({ username: username });
        if (existingUser) return res.status(400).json({ msg: 'Username này đã được sử dụng' });
        user.username = username;
        await user.save();
        res.json({ msg: 'Cập nhật Profile thành công', user });
    } catch (err) {
        console.error('LỖI TRONG ROUTE UPDATE PROFILE:', err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'Vui lòng chọn một file ảnh' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }
        user.avatarUrl = req.file.filename;
        await user.save();
        res.json({
            msg: 'Cập nhật ảnh đại diện thành công',
            avatarUrl: user.avatarUrl
        });
    } catch (err) {
        console.error('LỖI TRONG ROUTE UPLOAD-AVATAR:', err.message);
        if (typeof err === 'string') {
            return res.status(400).json({ msg: err });
        }
        res.status(500).send('Lỗi từ phía server');
    }
});

module.exports = router;