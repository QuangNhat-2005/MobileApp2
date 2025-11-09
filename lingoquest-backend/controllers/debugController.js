const UserWord = require('../models/UserWord');
const User = require('../models/User'); 

exports.timeTravel = async (req, res) => {
    const userId = req.user.id;
    const WORDS_TO_FAST_FORWARD = 5;

    try {
        const user = await User.findById(userId);
        if (user) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            user.lastStudiedDate = yesterday; 
            await user.save();
        }
        const wordsToUpdate = await UserWord.find({
            user: userId,
            nextReviewDate: { $gt: new Date() }
        }).limit(WORDS_TO_FAST_FORWARD);

        let updatedCount = 0;
        if (wordsToUpdate.length > 0) {
            const wordIds = wordsToUpdate.map(word => word._id);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const updateResult = await UserWord.updateMany(
                { _id: { $in: wordIds } },
                { $set: { nextReviewDate: yesterday } }
            );
            updatedCount = updateResult.modifiedCount;
        }
        res.status(200).json({
            message: `Last studied date set to yesterday. Fast-forwarded ${updatedCount} words for review.`
        });

    } catch (error) {
        console.error("Error during time travel debug:", error);
        res.status(500).json({ message: "Server error during debug operation." });
    }
};