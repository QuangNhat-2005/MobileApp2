const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: 'default_avatar.png' },
    totalXp: { type: Number, default: 0 },
    sprintHighScore: { type: Number, default: 0 },
    studyStreak: { type: Number, default: 0 },
    lastStudiedDate: { type: Date },
    level: { type: Number, default: 1 },
    xpForCurrentLevel: { type: Number, default: 0 },
    xpToNextLevel: { type: Number, default: 100 },
    dailyGoalProgress: { type: Number, default: 0 },
    dailyGoalTotal: { type: Number, default: 10 },
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);