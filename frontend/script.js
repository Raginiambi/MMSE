// Base URL of your backend
const BASE_URL = 'http://127.0.0.1:5000';

// --------------------- LOGIN ---------------------
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        const user = data.user;
        localStorage.setItem("user", JSON.stringify(data.user));
        if (user.role === 'main_host') {
          window.location.href = "admin_dashboard.html";
        } else {
          window.location.href = "profile.html";
        }
      } else {
        alert("Login failed: " + (data.error || "Unknown error"));
      }
    });
}

// --------------------- REGISTER ---------------------
function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const location = document.getElementById("location").value;

  fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, age, gender })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      window.location.href = "login.html";
    });
}

// --------------------- PROFILE ---------------------
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("profile").innerHTML = `
    <p><strong>Name:</strong> ${user.name}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>Age:</strong> ${user.age}</p>
    <p><strong>Gender:</strong> ${user.gender}</p>
  `;
}

// --------------------- MMSE TEST ---------------------
let mmseQuestions = [];
let currentIndex = 0;
let startTime = null;

function loadMMSETest() {
  fetch(`${BASE_URL}/questions`)
    .then(res => res.json())
    .then(data => {
      mmseQuestions = data;
      currentIndex = 0;
      showQuestion(); // will now use renderQuestion
    });
}

function showQuestion() {
  if (currentIndex >= mmseQuestions.length) {
    alert("Test completed!");
    window.location.href = "summary.html";
    return;
  }

  const question = mmseQuestions[currentIndex];
  startTime = Date.now();

  // Call the dynamic renderer
  renderQuestion(question);
}

function submitAnswer() {
  const answer = document.getElementById("answerInput").value;
  const user = JSON.parse(localStorage.getItem("user"));
  const questionId = mmseQuestions[currentIndex].id;
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

  fetch(`${BASE_URL}/submit_answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.id,
      question_id: questionId,
      answer: answer,
      time_taken: timeTaken
    })
  }).then(res => res.json())
    .then(() => {
      currentIndex++;
      showQuestion();
    });
}


function loadScoreHistory() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return window.location.href = "login.html";

  fetch(`${BASE_URL}/score_history/${user.id}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("summary-container");
      if (data.length === 0) {
        container.innerHTML = "<p>No history found.</p>";
        return;
      }

      let html = `<table border="1"><tr><th>Question</th><th>Answer</th><th>Score</th><th>Time Taken</th><th>Date</th></tr>`;
      data.forEach(row => {
        html += `<tr>
          <td>${row.question_text}</td>
          <td>${row.answer}</td>
          <td>${row.score_awarded}</td>
          <td>${row.time_taken_seconds}s</td>
          <td>${new Date(row.submitted_at).toLocaleString()}</td>
        </tr>`;
      });
      html += `</table>`;
      container.innerHTML = html;
    });
}


function (question) {
  const container = document.getElementById('question-area');
  container.innerHTML = `<h3><strong>Q${question.id}:</strong> ${question.question_text}</h3>`;

  // Clear previous answer input
  let inputHTML = '';

  // Handle types
  switch (question.answer_type) {
    case 'calendar':
      inputHTML = `<input type="date" id="answerInput" class="answer-box">`;
      break;

    case 'image_choice':
      inputHTML = `<div id="image-options">`;
      question.options.forEach((imgSrc, idx) => {
        inputHTML += `
          <img src="images/${imgSrc}" 
               alt="Option ${idx}" 
               class="choice-img"
               onclick="selectImageOption(this, '${imgSrc}')">
        `;
      });
      inputHTML += `</div><input type="hidden" id="answerInput">`;
      break;

    case 'multiple_choice':
      inputHTML = `<div id="mcq-options">`;
      question.options.forEach(opt => {
        inputHTML += `
          <label>
            <input type="radio" name="mcq" value="${opt}" onclick="document.getElementById('answerInput').value='${opt}'">
            ${opt}
          </label><br>`;
      });
      inputHTML += `<input type="hidden" id="answerInput">`;
      break;

    default:
      inputHTML = `<input type="text" id="answerInput" class="answer-box" placeholder="Your answer here">`;
      break;
  }

  // Add Submit Button
  inputHTML += `<br><button onclick="submitAnswer()" class="submit-btn">Submit</button>`;
  container.innerHTML += inputHTML;
}
function selectImageOption(element, value) {
  document.getElementById('answerInput').value = value;

  // Highlight selection
  document.querySelectorAll(".choice-img").forEach(img => img.classList.remove('selected'));
  element.classList.add('selected');
}


function submitImageAnswer(selectedImage, questionId) {
  const user = JSON.parse(localStorage.getItem("user"));
  const sessionId = localStorage.getItem("session_id");

  const payload = {
    user_id: user.id,
    question_id: questionId,
    answer: selectedImage,
    time_taken: 3, // adjust with actual timer if used
    test_session_id: sessionId
  };

  fetch("http://127.0.0.1:5000/submit_answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    console.log("Answer submitted:", data);
    loadNextQuestion(); // or however you're loading next one
  });
}
