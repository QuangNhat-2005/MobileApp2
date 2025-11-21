// controllers/reviewController.js
const reviewService = require('../services/reviewService');

exports.getReviewSession = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Gọi Service để lấy dữ liệu
        const reviewWords = await reviewService.getWordsForReview(userId);

        if (reviewWords.length === 0) {
            return res.json({ message: "Excellent! You have no words to review right now." });
        }

        res.json({ reviewWords });

    } catch (error) {
        console.error("Error in getReviewSession:", error.message);
        res.status(500).json({ message: "Server error while fetching review session." });
    }
};