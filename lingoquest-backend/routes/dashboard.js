const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkDailyReset = require('../middleware/checkDailyReset');
const dashboardController = require('../controllers/dashboardController');
router.get(
    '/stats',
    auth,
    checkDailyReset,
    dashboardController.getStats
);
router.get('/profile', auth, dashboardController.getProfile);
router.post('/reset-progress', auth, dashboardController.resetProgress);

module.exports = router;