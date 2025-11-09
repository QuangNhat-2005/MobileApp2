const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const UserWord = require('../models/UserWord');
const Word = require('../models/Word');
const { updateUserXpAndLevel } = require('../helpers/xpHelper'); 
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
router.get('/high-score', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('sprintHighScore');
        if (!user) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }
        res.json({ highScore: user.sprintHighScore || 0 });
    } catch (err) {
        console.error("Lỗi khi lấy điểm cao:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});
router.get('/sprint-questions', auth, async (req, res) => {
    try {
        const learnedUserWords = await UserWord.find({
            user: req.user.id,
            proficiencyLevel: { $gt: 0 }
        }).populate('word');
        const learnedWords = learnedUserWords.map(uw => uw.word).filter(Boolean);
        if (learnedWords.length < 4) {
            return res.status(400).json({ msg: 'Bạn cần học ít nhất 4 từ để bắt đầu Sprint!' });
        }
        const questions = learnedWords.map(correctWord => {
            const distractors = shuffleArray(learnedWords.filter(w => w._id.toString() !== correctWord._id.toString())).slice(0, 3);
            const questionType = Math.random() > 0.5 ? 'meaning_to_word' : 'word_to_meaning';
            if (questionType === 'meaning_to_word') {
                const options = shuffleArray([
                    { text: correctWord.text, isCorrect: true },
                    ...distractors.map(d => ({ text: d.text, isCorrect: false }))
                ]);
                return {
                    wordId: correctWord._id,
                    questionType,
                    promptText: correctWord.meaning,
                    options,
                    correctAnswer: correctWord.text
                };
            } else {
                const options = shuffleArray([
                    { text: correctWord.meaning, isCorrect: true },
                    ...distractors.map(d => ({ text: d.meaning, isCorrect: false }))
                ]);
                return {
                    wordId: correctWord._id,
                    questionType,
                    promptText: correctWord.text,
                    options,
                    correctAnswer: correctWord.meaning
                };
            }
        });
        res.json(shuffleArray(questions).slice(0, 50));
    } catch (err) {
        console.error("Lỗi khi tạo câu hỏi Sprint:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

router.post('/sprint-results', auth, async (req, res) => {
    const { score } = req.body;

    if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ msg: 'Điểm số không hợp lệ' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'Không tìm thấy người dùng' });
        }
        const xpGained = Math.floor(score / 10);
        if (xpGained > 0) {
            updateUserXpAndLevel(user, xpGained);
        }
        let newHighScore = false;
        if (score > (user.sprintHighScore || 0)) {
            user.sprintHighScore = score;
            newHighScore = true;
        }

        await user.save();

        res.json({
            message: 'Kết quả đã được ghi nhận',
            newHighScore: newHighScore,
            updatedScore: user.sprintHighScore
        });

    } catch (err) {
        console.error("Lỗi khi lưu kết quả Sprint:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

module.exports = router;