const UserWord = require('../models/UserWord');
const Word = require('../models/Word');

const LESSON_SIZE = 10; // Số lượng từ trong 1 bài học

const getLessonSession = async (userId, deckId) => {
    // 1. Lấy tất cả tiến độ học của user trong bộ từ này
    const allUserWordsInDeck = await UserWord.find({ user: userId, deck: deckId }).populate('word');
    
    // 2. Lấy tất cả từ vựng gốc trong bộ từ
    const allWordsInDeck = await Word.find({ deck: deckId });

    // 3. Lọc ra các nhóm từ
    
    // Nhóm A: Cần ôn tập (Đã học + Đến hạn review)
    const wordsToReview = allUserWordsInDeck
        .filter(uw => uw.word && uw.proficiencyLevel > 0 && uw.nextReviewDate <= new Date())
        .sort((a, b) => a.nextReviewDate - b.nextReviewDate) // Ưu tiên từ hết hạn lâu nhất
        .map(uw => uw.word);

    // Nhóm B: Cần học lại (Đã học nhưng quên - Level 0)
    const wordsToRelearn = allUserWordsInDeck
        .filter(uw => uw.word && uw.proficiencyLevel === 0)
        .map(uw => uw.word);

    // Nhóm C: Từ mới (Chưa học bao giờ)
    const learnedWordIds = new Set(allUserWordsInDeck.map(uw => uw.word._id.toString()));
    const newWords = allWordsInDeck.filter(word => !learnedWordIds.has(word._id.toString()));

    // 4. Ghép từ vào bài học (Ưu tiên A -> B -> C) cho đến khi đủ LESSON_SIZE
    let finalSessionWords = [];

    // Nạp từ ôn tập
    finalSessionWords.push(...wordsToReview);

    // Nếu còn chỗ, nạp từ học lại
    let remainingSlots = LESSON_SIZE - finalSessionWords.length;
    if (remainingSlots > 0) {
        finalSessionWords.push(...wordsToRelearn.slice(0, remainingSlots));
    }

    // Nếu vẫn còn chỗ, nạp từ mới
    remainingSlots = LESSON_SIZE - finalSessionWords.length;
    if (remainingSlots > 0) {
        finalSessionWords.push(...newWords.slice(0, remainingSlots));
    }

    // 5. Kiểm tra kết quả
    if (finalSessionWords.length === 0) {
        return { message: "Chúc mừng! Bạn đã học hết từ trong chủ đề này." };
    }

    // Phân loại để trả về cho Frontend hiển thị (Flashcard từ mới hoặc Quiz)
    const newWordsForSession = finalSessionWords.filter(w => !learnedWordIds.has(w._id.toString()));
    const reviewWordsForSession = finalSessionWords.filter(w => learnedWordIds.has(w._id.toString()));

    return {
        newWords: newWordsForSession,
        reviewWords: reviewWordsForSession
    };
};

module.exports = {
    getLessonSession
};