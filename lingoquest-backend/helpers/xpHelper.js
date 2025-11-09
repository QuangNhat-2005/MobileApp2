const getTotalXpForLevel = (level) => {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level - 1, 1.5));
};
const calculateLevelFromXp = (totalXp) => {
    let level = 1;
    while (getTotalXpForLevel(level + 1) <= totalXp) {
        level++;
    }
    return level;
};
const updateUserXpAndLevel = (user, xpGained) => {
    if (!user || typeof xpGained !== 'number' || xpGained <= 0) {
        return { didLevelUp: false };
    }

    user.totalXp = (user.totalXp || 0) + xpGained;

    const oldLevel = user.level || 1;
    const newLevel = calculateLevelFromXp(user.totalXp);

    const didLevelUp = newLevel > oldLevel;

    if (didLevelUp) {
        user.level = newLevel;
    }
    const xpForCurrentLevelBase = getTotalXpForLevel(newLevel);
    const xpForNextLevelBase = getTotalXpForLevel(newLevel + 1);

    user.xpForCurrentLevel = user.totalXp - xpForCurrentLevelBase;
    user.xpToNextLevel = xpForNextLevelBase - xpForCurrentLevelBase;

    return { didLevelUp, newLevel };
};

module.exports = {
    updateUserXpAndLevel,
    calculateLevelFromXp,
    getTotalXpForLevel
};