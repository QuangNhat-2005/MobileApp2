const mongoose = require('mongoose');

const DeckSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    iconName: { type: String, required: true }, 
});

module.exports = mongoose.model('Deck', DeckSchema);