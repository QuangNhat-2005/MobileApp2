const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const token = await authService.registerUser(req.body);
        res.status(201).json({ token });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const token = await authService.loginUser(req.body);
        res.json({ token });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const profile = await authService.getUserProfile(req.user.id);
        res.json(profile);
    } catch (err) {
        res.status(500).send('Lỗi Server');
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ msg: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }
    try {
        await authService.changePassword(req.user.id, currentPassword, newPassword);
        res.json({ msg: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { username } = req.body;
    if (!username || username.trim().length < 3) {
        return res.status(400).json({ msg: 'Username phải có ít nhất 3 ký tự' });
    }
    try {
        const user = await authService.updateProfile(req.user.id, username);
        res.json({ msg: 'Cập nhật Profile thành công', user });
    } catch (err) {
        res.status(400).json({ msg: err.message });
    }
};

exports.uploadAvatar = async (req, res) => {
    if (!req.file) return res.status(400).json({ msg: 'Vui lòng chọn file ảnh' });
    try {
        const avatarUrl = await authService.updateAvatar(req.user.id, req.file.filename);
        res.json({ msg: 'Cập nhật ảnh đại diện thành công', avatarUrl });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};