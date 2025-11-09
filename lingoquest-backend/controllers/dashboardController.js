const User = require('../models/User');
const UserWord = require('../models/UserWord');
exports.getStats = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            username: user.username,
            level: user.level || 1,
            streak: user.studyStreak || 0,
            dailyGoalProgress: user.dailyGoalProgress,
            dailyGoalTotal: user.dailyGoalTotal,
            avatarUrl: user.avatarUrl,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Lỗi từ phía server');
    }
};
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        const wordsLearnedCount = await UserWord.countDocuments({
            user: req.user.id,
            proficiencyLevel: { $gt: 0 }
        });

        res.json({
            username: user.username,
            email: user.email,
            level: user.level,
            xpForCurrentLevel: user.xpForCurrentLevel,
            xpToNextLevel: user.xpToNextLevel,
            streak: user.studyStreak || 0,
            wordsLearned: wordsLearnedCount,
            avatarUrl: user.avatarUrl, 
        });

    } catch (err) {
        console.error("Lỗi trong API /profile:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
};
exports.resetProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        await UserWord.deleteMany({ user: userId });

        const user = await User.findById(userId);
        if (user) {
            user.totalXp = 0;
            user.level = 1;
            user.xpForCurrentLevel = 0;
            user.xpToNextLevel = 100;
            user.studyStreak = 0;
            user.lastStudiedDate = null;
            user.sprintHighScore = 0;
            user.avatarUrl = 'default_avatar.png';
            await user.save();
        }

        res.json({ msg: 'Toàn bộ tiến độ của bạn đã được reset.' });

    } catch (err) {
        console.error("Lỗi khi reset tiến độ:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
};