const wordService = require('../services/wordService');
const mongoose = require('mongoose');

exports.submitAnswer = async (req, res) => {
    const { wordId, isCorrect } = req.body;
    if (!mongoose.Types.ObjectId.isValid(wordId)) {
        return res.status(400).json({ msg: 'ID từ vựng không hợp lệ' });
    }

    try {
        await wordService.processAnswer(req.user.id, wordId, isCorrect);
        res.status(204).send(); 
    } catch (err) {
        console.error("Lỗi submitAnswer:", err.message);
        res.status(500).send('Lỗi Server');
    }
};

exports.getWord = async (req, res) => {
    const { wordId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(wordId)) {
        return res.status(400).json({ msg: 'ID từ vựng không hợp lệ' });
    }
    try {
        const data = await wordService.getWordDetails(req.user.id, wordId);
        res.json(data);
    } catch (err) {
        res.status(404).json({ msg: err.message });
    }
};