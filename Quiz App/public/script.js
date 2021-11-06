let request = {};
let response = {};
let user_ans = {};

const startButton = document.querySelector('#start-button');
startButton.addEventListener('click', async function() {

    document.querySelector('#introduction').classList.toggle('hidden');
    document.getElementById('smbt').classList.remove("hidden");

    // Get API
    // IMPROVE 2
    const id = localStorage.getItem('id') || '';
    await fetch("http://localhost:3000/attempt/" + String(id), {
            method: id ? 'GET' : 'POST',
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(res => res.json())

    .then(json => {
        // console.log(json);
        // Generate questions and answers 
        request = json;
        localStorage.setItem('id', request._id);
        generateQuiz();
    })
});

const submitButton = document.querySelector('#submit-button');
submitButton.addEventListener('click', async function() {

    //Are you sure ? :3
    if (!confirm("Finish attempt?")) {
        return
    } else {
        alert();
    }

    document.getElementById('smbt').style.display = "none";
    document.getElementById('retry').classList.remove("hidden");

    // Add user's answers into user_ans
    document.querySelectorAll('.ans-radio').forEach(c => {
        if (c.checked === true) {
            user_ans[c.getAttribute("id").split('_')[0]] = `${c.getAttribute("id").split('_')[1]}`;
        }
    })

    // Submit API for checking answers
    await fetch("http://localhost:3000/attempt/" + String(request._id) + "/submit", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                'answers': user_ans
            })
        })
        .then(res => res.json())

    .then(json => {

            response = json;
            // console.log(json);

            // Display result 
            displayResult();

            // Refresh page
            document.querySelector('#retry-button').addEventListener('click', function() {
                location.reload();
                document.querySelector('.head').scrollIntoView()
            })

            // Display correct/incorrect answers
            displayAnswers();
        })
        .finally(() => {
            localStorage.removeItem('id');
        });
});


function generateQuiz() {
    const qs = document.getElementById('ques-container');
    let quizStr = '';

    request.questions.forEach(function(question, qIndex) {
        let answers = '';
        question.answers.forEach(function(ans, aIndex) {
            answers += `
                    <label for="${question._id}_${aIndex}" class="answers">
                        <input class="ans-radio" type="radio" name="${question._id}" id=${question._id}_${aIndex}>
                        <span>${ans.replaceAll('<', '&#60').replaceAll('>', '&#62').replaceAll('/', '&#47')}</span>
                        <div class="highlighter"></div>                        
                    </label><br>
                    `
        })
        quizStr += `
                    <form>
                        <h2 class="text"><strong> Question ${qIndex + 1} of ${request.questions.length} </strong></h2>
                        <p class="text"> ${question.text} </p> 
                        <div class="ans-holder text">
                            ${answers}
                        </div>
                    </form>
                `
    })
    qs.innerHTML = quizStr;
}

function displayResult() {
    const resultContainer = document.getElementById('retry');
    let result = '';
    result += `
        <h2 class="text"> Result: </h2>
        <p> ${response.score}/${response.questions.length} </p>
        <p> ${response.score / response.questions.length * 100}% </p>
        <p>${response.scoreText}</p>
        <button id="retry-button" class="blue">Try again</button>
        `;
    resultContainer.innerHTML = result;
}

function displayAnswers() {
    let answers = response.correctAnswers;
    for (const answer in answers) {
        document.querySelectorAll(`[name="${answer}"]`).forEach(c => {
            c.disabled = true;
            if (c.getAttribute('id').split('_')[1] == answers[answer]) {
                if (c.checked === true) {
                    c.parentElement.classList.add('correct');
                } else {
                    c.parentElement.classList.add('nexttime');
                }
            } else {
                if (c.checked === true) {
                    c.parentElement.classList.add('incorrect');
                }
            }
        });
    }
}