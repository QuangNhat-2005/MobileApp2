const lessonService = require('../services/lessonService');

exports.getSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { deckId } = req.params;

        const result = await lessonService.getLessonSession(userId, deckId);

        res.json(result);

    } catch (err) {
        console.error("Lỗi trong lessonController:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
};