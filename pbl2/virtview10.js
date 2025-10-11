// Pool of 20 medium-level cybersecurity MCQ questions (all complete)
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
            "a) Symmetric uses the same key for encryption and decryption; asymmetric uses public/private keys",
            "b) Symmetric is faster but less secure; asymmetric is slower but uses one key",
            "c) Symmetric requires internet; asymmetric does not",
            "d) There is no difference; they are interchangeable"
        ],
        correct: "a"
    },
    { 
        text: "Which attack involves tricking users into revealing sensitive information via email?", 
        options: [
            "a) Phishing",
            "b) SQL Injection",
            "c) Buffer Overflow",
            "d) DDoS"
        ],
        correct: "a"
    },
    { 
        text: "What does 'Zero Trust' architecture assume?", 
        options: [
            "a) No user or device inside the network is trusted by default",
            "b) All internal traffic is automatically trusted",
            "c) Only external threats need monitoring",
            "d) Trust is based solely on passwords"
        ],
        correct: "a"
    },
    { 
        text: "What is SQL injection primarily used for?", 
        options: [
            "a) Injecting malicious SQL code into input fields to manipulate databases",
            "b) Encrypting SQL queries for secure transmission",
            "c) Optimizing database performance",
            "d) Backing up SQL databases"
        ],
        correct: "a"
    },
    { 
        text: "Which protocol is commonly used for secure web communication (HTTPS)?", 
        options: [
            "a) SSL/TLS",
            "b) FTP",
            "c) HTTP",
            "d) SMTP"
        ],
        correct: "a"
    },
    { 
        text: "What is the principle of least privilege?", 
        options: [
            "a) Granting users only the minimum permissions needed to perform their tasks",
            "b) Giving all users full administrative access",
            "c) Sharing passwords among team members",
            "d) Encrypting all privileges"
        ],
        correct: "a"
    },
    { 
        text: "What does DDoS stand for, and what is its goal?", 
        options: [
            "a) Distributed Denial of Service; to overwhelm a system with traffic",
            "b) Direct Data Denial System; to steal data",
            "c) Distributed Defense of Service; to protect networks",
            "d) Digital Denial of Security; to encrypt traffic"
        ],
        correct: "a"
    },
    { 
        text: "Which is a common prevention method for cross-site scripting (XSS)?", 
        options: [
            "a) Input validation and output encoding",
            "b) Disabling all JavaScript",
            "c) Using only HTTP instead of HTTPS",
            "d) Increasing server CPU power"
        ],
        correct: "a"
    },
    { 
        text: "What is multi-factor authentication (MFA)?", 
        options: [
            "a) Requiring multiple verification methods (e.g., password + biometrics)",
            "b) Using only one strong password",
            "c) Sharing credentials with trusted devices",
            "d) Encrypting factors in a database"
        ],
        correct: "a"
    },
    { 
        text: "What is a man-in-the-middle (MITM) attack?", 
        options: [
            "a) Intercepting communication between two parties without their knowledge",
            "b) Directly attacking a server with malware",
            "c) Flooding a network with requests",
            "d) Stealing physical hardware"
        ],
        correct: "a"
    },
    { 
        text: "Which organization publishes the OWASP Top 10 for web security risks?", 
        options: [
            "a) Open Web Application Security Project",
            "b) Oracle Web Analytics Society",
            "c) Open Worldwide Application Standards",
            "d) Organization for Web Access Protection"
        ],
        correct: "a"
    },
    { 
        text: "What is encryption at rest?", 
        options: [
            "a) Protecting data stored on devices (e.g., hard drives)",
            "b) Encrypting data while it's being transmitted",
            "c) Securing data in memory during processing",
            "d) Encrypting user passwords only"
        ],
        correct: "a"
    },
    { 
        text: "What is a buffer overflow attack?", 
        options: [
            "a) Overwriting memory buffers to execute arbitrary code",
            "b) Filling storage buffers to cause denial of service",
            "c) Encrypting buffer data for security",
            "d) Optimizing buffer usage in applications"
        ],
        correct: "a"
    },
    { 
        text: "What is the role of an Intrusion Detection System (IDS)?", 
        options: [
            "a) Monitoring network traffic for suspicious activity and alerting",
            "b) Automatically blocking threats in real-time",
            "c) Encrypting intrusion data",
            "d) Managing user logins"
        ],
        correct: "a"
    },
    { 
        text: "Which is an example of social engineering?", 
        options: [
            "a) Phishing emails to trick users",
            "b) Patching software vulnerabilities",
            "c) Installing firewalls",
            "d) Backing up data"
        ],
        correct: "a"
    },
    { 
        text: "What is a VPN primarily used for?", 
        options: [
            "a) Creating a secure, encrypted tunnel over the internet",
            "b) Scanning for viruses",
            "c) Hosting websites",
            "d) Managing email servers"
        ],
        correct: "a"
    },
    { 
        text: "What is a Certificate Authority (CA) in PKI?", 
        options: [
            "a) An entity that issues digital certificates to verify identities",
            "b) A tool for encrypting certificates",
            "c) A database for storing public keys",
            "d) A protocol for key generation"
        ],
        correct: "a"
    },
    { 
        text: "What is a common vulnerability in IoT devices?", 
        options: [
            "a) Weak default passwords and lack of encryption",
            "b) Overly strong authentication",
            "c) Automatic firmware updates",
            "d) Built-in firewalls"
        ],
        correct: "a"
    }
];

let selectedQuestions = [];
let currentQuestionIndex = 0;
let numQuestions = 0;
let score = 0;
let currentAnswers = []; // To store answers for review

const startBtn = document.getElementById('start-btn');
const questionContainer = document.getElementById('question-container');
const questionEl = document.getElementById('question');
const nextBtn = document.getElementById('next-btn');
const progressEl = document.getElementById('progress');
const currentQEl = document.getElementById('current-q');
const totalQEl = document.getElementById('total-q');
const completionEl = document.getElementById('completion');
const restartBtn = document.getElementById('restart-btn');
const scoreMessage = document.getElementById('score-message');
const mcqOptions = document.getElementById('mcq-options');

// Start interview
startBtn.addEventListener('click', startInterview);

function startInterview() {
    // Randomly select 5-10 questions from the full pool
    numQuestions = Math.floor(Math.random() * 6) + 5; // 5 to 10
    selectedQuestions = [];
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    selectedQuestions = shuffled.slice(0, numQuestions);
    currentAnswers = []; // Reset answers
    score = 0; // Reset score

    currentQuestionIndex = 0;
    startBtn.style.display = 'none';
    questionContainer.style.display = 'block';
    completionEl.style.display = 'none';

    showNextQuestion();
}

function showNextQuestion() {
    if (currentQuestionIndex < numQuestions) {
        const currentQuestion = selectedQuestions[currentQuestionIndex];
        questionEl.textContent = currentQuestion.text;
        currentQEl.textContent = currentQuestionIndex + 1;
        totalQEl.textContent = numQuestions;

        // Always show MCQ options (since all are MCQs)
        mcqOptions.style.display = 'block';
        generateMCQOptions(currentQuestion.options);
        nextBtn.disabled = true; // Enable on radio selection
    } else {
        endInterview();
    }
}

// Generate radio buttons for MCQ
function generateMCQOptions(options) {
    let html = '';
    options.forEach((option, index) => {
        const optionKey = option.split(')')[0].trim(); // e.g., "a"
        html += `
            <div class="mcq-option">
                <input type="radio" id="option${currentQuestionIndex}-${index}" name="mcq-answer" value="${optionKey}" />
                <label for="option${currentQuestionIndex}-${index}">${option}</label>
            </div>
        `;
    });
    mcqOptions.innerHTML = html;

    // Add event listener for radio selection (enable next button)
    const radios = mcqOptions.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            nextBtn.disabled = false;
        });
    });
}

// Next question
nextBtn.addEventListener('click', () => {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    let answer = '';

    // Get selected radio value
    const selectedRadio = mcqOptions.querySelector('input[type="radio"]:checked');
    if (selectedRadio) {
        answer = selectedRadio.value; // e.g., "a"
    }

    // Check if correct and update score
    if (answer === currentQuestion.correct) {
        score++;
    }

    // Store answer for logging/review
    currentAnswers.push({ question: currentQuestion.text, answer: answer, correct: currentQuestion.correct });
    console.log(`Answer for Q${currentQuestionIndex + 1}: ${answer} (Correct: ${currentQuestion.correct})`);

    currentQuestionIndex++;
    showNextQuestion();
});

function endInterview() {
    questionContainer.style.display = 'none';
    completionEl.style.display = 'block';
    scoreMessage.textContent = `You scored ${score}/${numQuestions}! Great job! Review your responses or restart for more practice.`;
    console.log('Full Session Results:', { score: score, total: numQuestions, answers: currentAnswers });
}

// Restart
restartBtn.addEventListener('click', () => {
    completionEl.style.display = 'none';
    startBtn.style.display = 'block';
    mcqOptions.innerHTML = '';
    nextBtn.disabled = true;
    scoreMessage.textContent = 'Great job! Review your responses or restart for more practice.'; // Reset message
});
