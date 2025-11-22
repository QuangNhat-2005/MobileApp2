const UserWord = require('../models/UserWord');
const Word = require('../models/Word');
const User = require('../models/User');
const { updateUserXpAndLevel } = require('../helpers/xpHelper');

const REVIEW_INTERVALS = [1, 2, 4, 7, 14, 30, 90];

const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
};

const processAnswer = async (userId, wordId, isCorrect) => {
    const [user, userWordData] = await Promise.all([
        User.findById(userId),
        UserWord.findOne({ user: userId, word: wordId })
    ]);

    if (!user) throw new Error('User not found');

    let userWord = userWordData;
    let isNewWord = false;

    // Nếu chưa học từ này bao giờ -> Tạo mới
    if (!userWord) {
        const word = await Word.findById(wordId);
        if (!word) throw new Error('Word not found');
        isNewWord = true;
        userWord = new UserWord({
            user: userId,
            word: wordId,
            deck: word.deck,
            proficiencyLevel: 0,
        });
    }

    const today = new Date();

    // Cập nhật Daily Goal
    if (isNewWord || !isSameDay(userWord.lastReviewedAt, today)) {
        user.dailyGoalProgress += 1;
    }
    user.lastStudiedDate = today;

    // Logic SRS (Spaced Repetition System)
    if (isCorrect) {
        userWord.proficiencyLevel += 1;
        updateUserXpAndLevel(user, 10); 
    } else {
        userWord.proficiencyLevel = Math.max(0, userWord.proficiencyLevel - 1);
    }

    // Tính ngày review tiếp theo
    const newLevel = userWord.proficiencyLevel;
    const reviewDate = new Date();
    
    if (newLevel === 0) {
        reviewDate.setMinutes(reviewDate.getMinutes() + 10); // Ôn lại sau 10p nếu sai
    } else if (newLevel <= REVIEW_INTERVALS.length) {
        const daysToAdd = REVIEW_INTERVALS[newLevel - 1];
        reviewDate.setDate(reviewDate.getDate() + daysToAdd);
    } else {
        reviewDate.setFullYear(reviewDate.getFullYear() + 1); // Đã thuộc lòng (Mastered)
    }

    userWord.nextReviewDate = reviewDate;
    userWord.lastReviewedAt = today;

    await Promise.all([user.save(), userWord.save()]);
    return { success: true };
};

const getWordDetails = async (userId, wordId) => {
    const word = await Word.findById(wordId).lean();
    if (!word) throw new Error('Word not found');
    const progress = await UserWord.findOne({ user: userId, word: wordId }).lean();
    return { word, progress };
};

module.exports = {
    processAnswer,
    getWordDetails
};