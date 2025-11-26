// =====================================
// CYBERSECURITY QUESTION BANK
// =====================================
const questions = [
    {
        text: "What does the 'CIA' triad stand for in cybersecurity?",
        options: [
            "a) Confidentiality, Integrity, Availability",
            "b) Control, Identification, Authentication",
            "c) Confidentiality, Isolation, Accessibility",
            "d) Centralization, Integration, Authorization"
        ],
        correct: "a"
    },
    {
        text: "Which of the following is the primary goal of a firewall?",
        options: [
            "a) To monitor and control incoming and outgoing network traffic",
            "b) To encrypt all data transmissions",
            "c) To perform vulnerability scans",
            "d) To manage user authentication"
        ],
        correct: "a"
    },
    {
        text: "What is the main difference between symmetric and asymmetric encryption?",
        options: [
            "a) Same key for encryption and decryption; asymmetric uses public/private keys",
            "b) Symmetric is slower but less secure",
            "c) Symmetric requires internet; asymmetric does not",
            "d) No difference"
        ],
        correct: "a"
    },
    {
        text: "What does 'Zero Trust' architecture assume?",
        options: [
            "a) No user/device is trusted by default",
            "b) All internal traffic is trusted",
            "c) Only external threats need monitoring",
            "d) Trust is based on passwords"
        ],
        correct: "a"
    },
    {
        text: "Which attack involves tricking users via email?",
        options: [
            "a) Phishing",
            "b) SQL Injection",
            "c) Buffer Overflow",
            "d) DDoS"
        ],
        correct: "a"
    },
    {
        text: "What is a VPN primarily used for?",
        options: [
            "a) Creating a secure, encrypted tunnel",
            "b) Scanning for viruses",
            "c) Hosting websites",
            "d) Managing email servers"
        ],
        correct: "a"
    }
];

// =====================================
// MAIN INTERVIEW LOGIC
// =====================================
document.addEventListener("DOMContentLoaded", function () {

    const startBtn = document.getElementById("start-btn");
    const questionContainer = document.getElementById("question-container");
    const questionEl = document.getElementById("question");
    const nextBtn = document.getElementById("next-btn");
    const currentQEl = document.getElementById("current-q");
    const totalQEl = document.getElementById("total-q");
    const completionEl = document.getElementById("completion");
    const restartBtn = document.getElementById("restart-btn");
    const scoreMessage = document.getElementById("score-message");
    const mcqOptions = document.getElementById("mcq-options");

    let selectedQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    const numQuestions = 6; // FIXED 6 QUESTIONS

    // ▶ START INTERVIEW
    startBtn.addEventListener("click", startInterview);

    function startInterview() {
        selectedQuestions = [...questions].sort(() => 0.5 - Math.random()).slice(0, numQuestions);
        currentQuestionIndex = 0;
        score = 0;
        totalQEl.textContent = numQuestions;

        startBtn.style.display = "none";
        questionContainer.style.display = "block";
        completionEl.style.display = "none";

        showNextQuestion();
    }

    // 🔁 DISPLAY NEXT QUESTION
    function showNextQuestion() {
        if (currentQuestionIndex < numQuestions) {
            const currentQuestion = selectedQuestions[currentQuestionIndex];
            questionEl.textContent = currentQuestion.text;
            currentQEl.textContent = currentQuestionIndex + 1;

            mcqOptions.innerHTML = currentQuestion.options.map((opt) =>
                `<div class="mcq-option">
                    <input type="radio" name="mcq" value="${opt.charAt(0)}" />
                    <label>${opt}</label>
                </div>`
            ).join("");

            document.querySelectorAll('input[name="mcq"]').forEach(radio => {
                radio.addEventListener("change", () => nextBtn.disabled = false);
            });

            nextBtn.disabled = true; // Disable until option selected
        } else {
            endInterview();
        }
    }

    // ⏭ NEXT QUESTION BUTTON
    nextBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="mcq"]:checked');
        if (selected && selected.value === selectedQuestions[currentQuestionIndex].correct) {
            score++;
        }
        currentQuestionIndex++;
        showNextQuestion();
    });

    // 🎉 END INTERVIEW & SHOW RESULT
    function endInterview() {
        questionContainer.classList.add("fade-out");

        let rank = "";
        if (score === 6) rank = "🟢 Cyber Mastermind!";
        else if (score >= 4) rank = "🟡 Cyber Defender!";
        else rank = "🔴 Rookie – Keep Practicing!";

        setTimeout(() => {
            questionContainer.style.display = "none";
            completionEl.style.display = "block"; // Ensure visibility
            completionEl.classList.add("show"); // Glow animation
            scoreMessage.textContent = `🔥 You scored ${score}/6! ${rank}`;
        }, 600); // Matches fadeOut duration
    }

    // 🔁 RESTART
    restartBtn.addEventListener("click", () => location.reload());
});
