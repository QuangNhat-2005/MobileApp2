const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
    text: { type: String, required: true },
    meaning: { type: String, required: true },
    pronunciation: { type: String },
    example: { type: String },
    imageName: { type: String },
    deck: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
    exampleTranslation: { type: String },
    synonyms: [String],
    antonyms: [String],
    relatedWords: [String], 
    wordForms: [{          
        form: String,      
        word: String
    }],
});

module.exports = mongoose.model('Word', WordSchema);