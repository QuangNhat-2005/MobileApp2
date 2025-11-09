const UserWord = require('../models/UserWord');
const mongoose = require('mongoose'); 
exports.getReviewSession = async (req, res) => {
    const userId = req.user.id;
    const REVIEW_LIMIT = 10; 
    try {
        const wordsToReview = await UserWord.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId), 
                    nextReviewDate: { $lte: new Date() },
                    isMastered: false
                }
            },
            { $sample: { size: REVIEW_LIMIT } },
            {
                $lookup: {
                    from: 'words', 
                    localField: 'word',
                    foreignField: '_id',
                    as: 'wordDetails'
                }
            },

            { $unwind: '$wordDetails' }
        ]);

        if (wordsToReview.length === 0) {
            return res.json({ message: "Excellent! You have no words to review right now." });
        }
        const reviewWords = wordsToReview.map(item => ({
            _id: item.wordDetails._id,
            text: item.wordDetails.text,
            meaning: item.wordDetails.meaning,
            example: item.wordDetails.example,
        }));
        res.json({ reviewWords });

    } catch (error) {
        console.error("Error fetching review session:", error);
        res.status(500).json({ message: "Server error while fetching review session." });
    }
};