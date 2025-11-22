const deckService = require('../services/deckService');

exports.getAllDecks = async (req, res) => {
    try {
        const decks = await deckService.getAllDecksWithProgress(req.user.id);
        res.json(decks);
    } catch (err) {
        res.status(500).send('Lỗi Server');
    }
};

exports.getDeckById = async (req, res) => {
    try {
        const deck = await deckService.getDeckDetail(req.user.id, req.params.deckId);
        res.json(deck);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};