const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserWord = require('../models/UserWord');
const Word = require('../models/Word');

const LESSON_SIZE = 10;

router.get('/session/:deckId', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { deckId } = req.params;

        const allUserWordsInDeck = await UserWord.find({ user: userId, deck: deckId }).populate('word');
        const allWordsInDeck = await Word.find({ deck: deckId });
        const wordsToReview = allUserWordsInDeck
            .filter(uw => uw.word && uw.proficiencyLevel > 0 && uw.nextReviewDate <= new Date())
            .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
            .map(uw => uw.word);

        
        const wordsToRelearn = allUserWordsInDeck
            .filter(uw => uw.word && uw.proficiencyLevel === 0)
            .map(uw => uw.word);

        
        const learnedWordIds = new Set(allUserWordsInDeck.map(uw => uw.word._id.toString()));
        const newWords = allWordsInDeck.filter(word => !learnedWordIds.has(word._id.toString()));

        
        let finalSessionWords = [];

        
        finalSessionWords.push(...wordsToReview);

        
        let remainingSlots = LESSON_SIZE - finalSessionWords.length;
        if (remainingSlots > 0) {
            finalSessionWords.push(...wordsToRelearn.slice(0, remainingSlots));
        }

        
        remainingSlots = LESSON_SIZE - finalSessionWords.length;
        if (remainingSlots > 0) {
            finalSessionWords.push(...newWords.slice(0, remainingSlots));
        }

       
        if (finalSessionWords.length === 0) {
            return res.json({ message: "Chúc mừng! Bạn đã học hết từ trong chủ đề này." });
        }

        const newWordsForSession = finalSessionWords.filter(w => !learnedWordIds.has(w._id.toString()));
        const reviewWordsForSession = finalSessionWords.filter(w => learnedWordIds.has(w._id.toString()));

        res.json({
            newWords: newWordsForSession,
            reviewWords: reviewWordsForSession
        });

    } catch (err) {
        console.error("Lỗi trong API /lesson/session:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

module.exports = router;