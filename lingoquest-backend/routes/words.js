// backend/routes/words.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const wordController = require('../controllers/wordController');

router.post('/answer', auth, wordController.submitAnswer);
router.get('/:wordId', auth, wordController.getWord);

module.exports = router;