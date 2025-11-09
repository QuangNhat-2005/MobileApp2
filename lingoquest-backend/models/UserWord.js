const mongoose = require('mongoose');
const UserWordSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    word: { type: mongoose.Schema.Types.ObjectId, ref: 'Word', required: true },
    deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
    proficiencyLevel: { type: Number, default: 0, min: 0 },
    lastReviewedAt: { type: Date, default: Date.now },
    nextReviewDate: { type: Date, default: Date.now },
    isMastered: { type: Boolean, default: false },

}, { timestamps: true, indexes: [{ fields: { user: 1, word: 1 }, unique: true }] });
module.exports = mongoose.model('UserWord', UserWordSchema);