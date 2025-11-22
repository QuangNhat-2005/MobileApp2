const Deck = require('../models/Deck');
const Word = require('../models/Word');
const UserWord = require('../models/UserWord');

const getAllDecksWithProgress = async (userId) => {
    const decks = await Deck.find().lean();

    return await Promise.all(decks.map(async (deck) => {
        const wordsInDeck = await Word.find({ deck: deck._id }).select('_id');
        const wordIds = wordsInDeck.map(w => w._id);
        
        const learnedCount = await UserWord.countDocuments({
            user: userId,
            word: { $in: wordIds },
            proficiencyLevel: { $gt: 0 }
        });

        const totalWords = wordIds.length;
        const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

        return { ...deck, wordCount: totalWords, progress };
    }));
};

const getDeckDetail = async (userId, deckId) => {
    const deck = await Deck.findById(deckId).lean();
    if (!deck) throw new Error('Không tìm thấy bộ từ');

    const wordsInDeck = await Word.find({ deck: deckId }).lean();
    const userWords = await UserWord.find({
        user: userId,
        word: { $in: wordsInDeck.map(w => w._id) }
    }).lean();

    // Tạo Map để tra cứu nhanh tiến độ
    const userWordsMap = new Map();
    userWords.forEach(uw => {
        userWordsMap.set(uw.word.toString(), uw.proficiencyLevel);
    });

    const wordsWithProgress = wordsInDeck.map(word => ({
        _id: word._id,
        text: word.text,
        proficiencyLevel: userWordsMap.get(word._id.toString()) || 0,
    }));

    const learnedCount = userWords.filter(uw => uw.proficiencyLevel > 0).length;
    const totalWords = wordsInDeck.length;
    const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

    return {
        _id: deck._id,
        name: deck.name,
        words: wordsWithProgress,
        newWordsCount: totalWords - learnedCount,
        progress
    };
};

module.exports = { getAllDecksWithProgress, getDeckDetail };