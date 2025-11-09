const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserWord = require('../models/UserWord');
const Word = require('../models/Word');
const User = require('../models/User');
const mongoose = require('mongoose');
const { updateUserXpAndLevel } = require('../helpers/xpHelper');

const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const reviewIntervals = [1, 2, 4, 7, 14, 30, 90];

router.post('/answer', auth, async (req, res) => {
    const { wordId, isCorrect } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(wordId)) {
        return res.status(400).json({ msg: 'ID từ vựng không hợp lệ' });
    }

    try {
        const [user, userWordData] = await Promise.all([
            User.findById(userId),
            UserWord.findOne({ user: userId, word: wordId })
        ]);

        if (!user) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }

        let userWord = userWordData;
        let isNewWord = false; 

        if (!userWord) {
            const word = await Word.findById(wordId);
            if (!word) return res.status(404).json({ msg: 'Không tìm thấy từ vựng gốc' });

            isNewWord = true; 
            userWord = new UserWord({
                user: userId,
                word: wordId,
                deck: word.deck,
                proficiencyLevel: 0,
            });
        }

        const today = new Date();
        if (isNewWord || !isSameDay(userWord.lastReviewedAt, today)) {
            user.dailyGoalProgress += 1;
        }

        user.lastStudiedDate = today;

        if (isCorrect) {
            userWord.proficiencyLevel += 1;
            updateUserXpAndLevel(user, 10);
        } else {
            userWord.proficiencyLevel = Math.max(0, userWord.proficiencyLevel - 1);
        }

        const newLevel = userWord.proficiencyLevel;
        const reviewDate = new Date();
        if (newLevel === 0) {
            reviewDate.setMinutes(reviewDate.getMinutes() + 10);
        } else if (newLevel > 0 && newLevel <= reviewIntervals.length) {
            const daysToAdd = reviewIntervals[newLevel - 1];
            reviewDate.setDate(reviewDate.getDate() + daysToAdd);
        } else {
            reviewDate.setFullYear(reviewDate.getFullYear() + 1);
        }
        userWord.nextReviewDate = reviewDate;
        userWord.lastReviewedAt = today;

        await Promise.all([
            user.save(),
            userWord.save()
        ]);

        res.status(204).send();

    } catch (err) {
        console.error("Lỗi trong API /answer:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});


router.post('/reset', auth, async (req, res) => {
    res.status(501).json({ msg: "Chức năng chưa được cài đặt" });
});
router.get('/:wordId', auth, async (req, res) => {
    try {
        const { wordId } = req.params;
        const userId = req.user.id;
        if (!mongoose.Types.ObjectId.isValid(wordId)) {
            return res.status(400).json({ msg: 'ID từ vựng không hợp lệ' });
        }
        const word = await Word.findById(wordId).lean();
        if (!word) {
            return res.status(404).json({ msg: 'Không tìm thấy từ vựng' });
        }
        const userProgress = await UserWord.findOne({ user: userId, word: wordId }).lean();
        res.json({
            word: word,
            progress: userProgress
        });
    } catch (err) {
        console.error("Lỗi trong API /:wordId :", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

module.exports = router;