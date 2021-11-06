const mongoose = require('mongoose');

const atmpt = mongoose.Schema({
    questions: [{}],
    completed: {
        type: { type: Boolean }
    },
    score: Number,
    startedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('attempt', atmpt, 'attempt');