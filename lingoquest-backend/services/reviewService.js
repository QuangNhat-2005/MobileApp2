// services/reviewService.js
const UserWord = require('../models/UserWord');
const mongoose = require('mongoose');

const getWordsForReview = async (userId, limit = 10) => {
    // Logic nghiệp vụ nằm ở đây
    const wordsToReview = await UserWord.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                nextReviewDate: { $lte: new Date() },
                isMastered: false
            }
        },
        { $sample: { size: limit } },
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

    return wordsToReview.map(item => ({
        _id: item.wordDetails._id,
        text: item.wordDetails.text,
        meaning: item.wordDetails.meaning,
        example: item.wordDetails.example,
        // Có thể thêm các trường khác nếu cần
    }));
};

module.exports = {
    getWordsForReview
};