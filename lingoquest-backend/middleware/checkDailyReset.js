const User = require('../models/User');

const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const isConsecutiveDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const nextDay = new Date(d1);
    nextDay.setDate(d1.getDate() + 1);
    return isSameDay(nextDay, d2);
};

const checkDailyReset = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next();

        const now = new Date();
        const lastStudied = user.lastStudiedDate;

        if (!lastStudied || !isSameDay(lastStudied, now)) {
            user.dailyGoalProgress = 0; 
            if (lastStudied && isConsecutiveDay(lastStudied, now)) {
                user.studyStreak += 1;
            } else {
                user.studyStreak = 1;
            }
        }
        user.lastStudiedDate = now;
        await user.save();

        req.user = user;

    } catch (error) {
        console.error("Error in daily reset middleware:", error);
    }

    next();
};

module.exports = checkDailyReset;