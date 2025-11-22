const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const lessonController = require('../controllers/lessonController');

// GET /api/lesson/session/:deckId
router.get('/session/:deckId', auth, lessonController.getSession);

module.exports = router;