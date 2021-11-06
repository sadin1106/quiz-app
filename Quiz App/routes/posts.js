const express = require('express');

const ObjectID = require('mongodb').ObjectID;

const router = express.Router();

const Questions = require('../question_model/question_model');
const Attempt = require('../question_model/attempt_model');

// CREATE NEW ATTEMPT
router.post('/', async function(req, res) {
    // this is for adding new questions and answers :V 

    // const Qmodel = new Questions({
    //     _id: ObjectID(),
    //     answers: req.body.answers,
    //     text: req.body.text,
    //     correctAns: req.body.correctAns,
    // })
    // try {
    //     const save = await Qmodel.save();
    //     res.status(201).json(save);
    // } catch (err) {
    //     res.json({ message: err })
    // }

    // create new attempt
    const randomQues = await Questions.aggregate([
        { $sample: { size: 10 } },
        { $unset: ["correctAns"] }
    ]);
    // console.log(randomQues)
    // IMPROVE !: NO CHEATING
    const Amodel = new Attempt({
        _id: ObjectID(),
        questions: randomQues,
        answers: Array.from({ length: randomQues.length }),
        completed: false,
        score: 0,
        scoreText: null,
    });

    try {
        const save = await Amodel.save();
        res.status(201).json(save);
    } catch (err) {
        res.json({ message: err });
    }
})

// IMPROVE 2: NO USELESS DATA
router.get('/:id', async function(req, res) {
    try {
        const post = await Attempt.findById(req.params.id);
        res.json(post);
    } catch (err) {
        res.json({ message: err })
    }
})

// SUBMIT USERS ANSWERS AND RETURN RESULT
router.post('/:id/submit', async function(req, res) {
    let score = 0;
    const user_ans = req.body.answers;
    let correctAnswers = {};

    const query = await Attempt.findOne({ _id: ObjectID(req.params.id), scoreText: null }, async(err, doc) => {
        if (err) throw err;
        for (let i = 0; i < doc.questions.length; i++) {
            let qID = doc.questions[i]._id;
            const ques = await Questions.findOne({ '_id': qID });
            correctAnswers[qID] = ques.correctAns;
            if (user_ans[qID] == ques.correctAns) {
                score += 1;
            }
        }

        switch (true) {
            case score < 5:
                doc.scoreText = "Practice more to improve it :D";
                break;
            case score < 7:
                doc.scoreText = "Good, keep up!";
                break;
            case score < 9:
                doc.scoreText = "Well done!";
                break;
            case score <= 10:
                doc.scoreText = "Perfect!";
                break;
        }
        doc.correctAnswers = correctAnswers;
        doc.score = score;
        doc.completed = true;
        await Attempt.updateOne({ '_id': ObjectID(query._id) }, [{ $set: doc }])
            .catch(err => {
                console.error(err)
                return res.status(500).end()
            })
        const qSet = await Questions.find({ '_id': { $in: query.questions } });
        const result = {
            _id: query._id,
            questions: qSet,
            correctAnswers: correctAnswers,
            answers: req.body.answers,
            score: score,
            scoreText: doc.scoreText,
            completed: true
        }

        res.json(result)
    })
    if (query == null) {
        return res.status(404).end();
    }
})

module.exports = router;