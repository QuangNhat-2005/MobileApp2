const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); 
const debugController = require('../controllers/debugController');


router.post('/time-travel', authMiddleware, debugController.timeTravel);

module.exports = router;