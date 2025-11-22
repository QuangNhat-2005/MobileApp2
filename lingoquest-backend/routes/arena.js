const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const arenaController = require('../controllers/arenaController');

// Lấy điểm cao
router.get('/high-score', auth, arenaController.getHighScore);

// Lấy danh sách câu hỏi
router.get('/sprint-questions', auth, arenaController.getSprintQuestions);

// Lưu kết quả chơi
router.post('/sprint-results', auth, arenaController.saveSprintResults);

module.exports = router;