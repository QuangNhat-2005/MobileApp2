const arenaService = require('../services/arenaService');

exports.getHighScore = async (req, res) => {
    try {
        const highScore = await arenaService.getHighScore(req.user.id);
        res.json({ highScore });
    } catch (err) {
        console.error("Lỗi lấy điểm cao:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
};

exports.getSprintQuestions = async (req, res) => {
    try {
        const questions = await arenaService.generateSprintQuestions(req.user.id);
        res.json(questions);
    } catch (err) {
        console.error("Lỗi tạo câu hỏi Sprint:", err.message);
        

        if (err.message === 'NOT_ENOUGH_WORDS') {
            return res.status(400).json({ msg: 'Bạn cần học ít nhất 4 từ để bắt đầu Sprint!' });
        }
        
        res.status(500).send('Lỗi từ phía server');
    }
};

exports.saveSprintResults = async (req, res) => {
    const { score } = req.body;

    if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ msg: 'Điểm số không hợp lệ' });
    }

    try {
        const result = await arenaService.processSprintResults(req.user.id, score);
        res.json({
            message: 'Kết quả đã được ghi nhận',
            ...result
        });
    } catch (err) {
        console.error("Lỗi lưu kết quả Sprint:", err.message);
        res.status(500).send('Lỗi từ phía server');
    }
};