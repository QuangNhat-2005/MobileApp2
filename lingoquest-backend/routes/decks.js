const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');
const Word = require('../models/Word');
const UserWord = require('../models/UserWord');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const decks = await Deck.find().lean();

        
        const decksWithDetails = await Promise.all(
            decks.map(async (deck) => {
               
                const wordsInDeck = await Word.find({ deck: deck._id }).select('_id');
                const wordIdsInDeck = wordsInDeck.map(w => w._id);
                const totalWords = wordIdsInDeck.length;

                
                const learnedCount = await UserWord.countDocuments({
                    user: userId,
                    word: { $in: wordIdsInDeck },
                    proficiencyLevel: { $gt: 0 }
                });

             
                const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;

                return {
                    ...deck,
                    wordCount: totalWords,
                    progress: progress,
                };
            })
        );

        res.json(decksWithDetails);

    } catch (err) {
        console.error("Lỗi trong GET /api/decks:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

router.get('/:deckId', auth, async (req, res) => {
    try {
        const { deckId } = req.params;
        const userId = req.user.id;

        const deck = await Deck.findById(deckId).lean();
        if (!deck) {
            return res.status(404).json({ msg: 'Không tìm thấy bộ từ' });
        }

        const wordsInDeck = await Word.find({ deck: deckId }).lean();
        const userWords = await UserWord.find({
            user: userId,
            word: { $in: wordsInDeck.map(w => w._id) }
        }).lean();

        const userWordsMap = new Map();
        userWords.forEach(uw => {
            userWordsMap.set(uw.word.toString(), {
                proficiencyLevel: uw.proficiencyLevel,
            });
        });

        const wordsWithProgress = wordsInDeck.map(word => {
            const progress = userWordsMap.get(word._id.toString());
            return {
                _id: word._id,
                text: word.text,
                proficiencyLevel: progress ? progress.proficiencyLevel : 0,
            };
        });

        const learnedCount = userWords.filter(uw => uw.proficiencyLevel > 0).length;
        const totalWords = wordsInDeck.length;
        const progress = totalWords > 0 ? Math.round((learnedCount / totalWords) * 100) : 0;
        const newWordsCount = totalWords - learnedCount;

        res.json({
            _id: deck._id,
            name: deck.name,
            words: wordsWithProgress,
            newWordsCount,
            progress: progress,
        });

    } catch (err) {
        console.error("Lỗi trong GET /api/decks/:deckId:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
});

module.exports = router;