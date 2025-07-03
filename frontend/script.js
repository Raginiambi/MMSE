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
      showQuestion();
    });
}

function showQuestion() {
  if (currentIndex >= mmseQuestions.length) {
    alert("Test completed!");
    window.location.href = "summary.html"; // redirect to summary
    return;
  }


  const question = mmseQuestions[currentIndex];
  startTime = Date.now();

  document.getElementById("question-box").innerHTML = `
    <p><strong>Q${currentIndex + 1}:</strong> ${question.question_text}</p>
    <input id="answer" placeholder="Your answer here"><br>
    <button onclick="submitAnswer(${question.id})">Submit</button>
  `;
}

function submitAnswer(questionId) {
  const answer = document.getElementById("answer").value;
  const user = JSON.parse(localStorage.getItem("user"));
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

  fetch(`${BASE_URL}/submit_answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: user.id,
      question_id: questionId,
      answer: answer,
      time_taken: timeTaken,
      score: 0 // default score
    })
  }).then(() => {
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

