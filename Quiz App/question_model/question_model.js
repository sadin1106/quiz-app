const mongoose = require('mongoose');
const ans_schema = mongoose.Schema({
    answers: {
        type: [{ type: String }],
        required: true
    },
    text: String,
    correctAns: Number
});

module.exports = mongoose.model('questions', ans_schema, 'questions');