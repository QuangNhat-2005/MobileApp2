const User = require('../models/User');
const UserWord = require('../models/UserWord');
const { updateUserXpAndLevel } = require('../helpers/xpHelper');

// Hàm tiện ích để xáo trộn mảng
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const getHighScore = async (userId) => {
    const user = await User.findById(userId).select('sprintHighScore');
    if (!user) throw new Error('Không tìm thấy người dùng');
    return user.sprintHighScore || 0;
};

const generateSprintQuestions = async (userId) => {
    // 1. Lấy danh sách từ đã học
    const learnedUserWords = await UserWord.find({
        user: userId,
        proficiencyLevel: { $gt: 0 }
    }).populate('word');

    const learnedWords = learnedUserWords.map(uw => uw.word).filter(Boolean);

    // 2. Kiểm tra điều kiện
    if (learnedWords.length < 4) {
        throw new Error('NOT_ENOUGH_WORDS'); 
    }

    // 3. Tạo câu hỏi
    const questions = learnedWords.map(correctWord => {
        // Lấy 3 từ sai làm nhiễu
        const distractors = shuffleArray(
            learnedWords.filter(w => w._id.toString() !== correctWord._id.toString())
        ).slice(0, 3);

        // Random loại câu hỏi (Nghĩa -> Từ hoặc Từ -> Nghĩa)
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

    // 4. Trả về 50 câu ngẫu nhiên
    return shuffleArray(questions).slice(0, 50);
};

const processSprintResults = async (userId, score) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');

    // Tính XP
    const xpGained = Math.floor(score / 10);
    if (xpGained > 0) {
        updateUserXpAndLevel(user, xpGained);
    }

    // Cập nhật điểm cao
    let newHighScore = false;
    if (score > (user.sprintHighScore || 0)) {
        user.sprintHighScore = score;
        newHighScore = true;
    }

    await user.save();

    return {
        newHighScore,
        updatedScore: user.sprintHighScore
    };
};

module.exports = {
    getHighScore,
    generateSprintQuestions,
    processSprintResults
};