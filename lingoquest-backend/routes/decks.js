const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const deckController = require('../controllers/deckController');

router.get('/', auth, deckController.getAllDecks);
router.get('/:deckId', auth, deckController.getDeckById);

module.exports = router;