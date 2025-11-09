const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); 
const reviewController = require('../controllers/reviewController');


router.get('/session', authMiddleware, reviewController.getReviewSession);

module.exports = router;


