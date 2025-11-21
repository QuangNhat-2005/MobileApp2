// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload'); // Import middleware vừa tạo
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/change-password', authMiddleware, authController.changePassword);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/upload-avatar', authMiddleware, uploadMiddleware.single('avatar'), authController.uploadAvatar);

module.exports = router;