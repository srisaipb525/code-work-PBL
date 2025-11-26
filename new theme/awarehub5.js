const chars = {
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            digits: '0123456789',
            special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
        

        function generatePassword() {
            const length = 16;
            let password = '';
            const allChars = chars.lowercase + chars.uppercase + chars.digits + chars.special;
            
            // Ensure at least one of each type
            password += chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)];
            password += chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)];
            password += chars.digits[Math.floor(Math.random() * chars.digits.length)];
            password += chars.special[Math.floor(Math.random() * chars.special.length)];
            
            for (let i = 4; i < length; i++) {
                password += allChars[Math.floor(Math.random() * allChars.length)];
            }
            
            // Shuffle
            password = password.split('').sort(() => Math.random() - 0.5).join('');
            
            const genDiv = document.getElementById('generatedPassword');
            genDiv.textContent = password;
            document.getElementById('passwordInput').value = password;
            genDiv.classList.add('show');
            checkPassword();
        }

        function estimateCrackTime(password) {
            // Simple entropy estimation
            const length = password.length;
            let charset = 0;
            if (/[a-z]/.test(password)) charset += 26;
            if (/[A-Z]/.test(password)) charset += 26;
            if (/[0-9]/.test(password)) charset += 10;
            if (/[^a-zA-Z0-9]/.test(password)) charset += 32; // Approx for symbols

            const combinations = Math.pow(charset, length);

            // Without AI: Assume 1 billion guesses/sec
            const guessesPerSecNoAI = 1e9;
            // With AI: Assume 100 billion guesses/sec
            const guessesPerSecAI = 1e11;

            const secondsNoAI = combinations / guessesPerSecNoAI;
            const secondsAI = combinations / guessesPerSecAI;

            return {
                noAI: formatTime(secondsNoAI),
                AI: formatTime(secondsAI)
            };
        }

        function formatTime(seconds) {
            if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
            if (seconds < 3600) return `${(seconds/60).toFixed(2)} minutes`;
            if (seconds < 86400) return `${(seconds/3600).toFixed(2)} hours`;
            if (seconds < 31536000) return `${(seconds/86400).toFixed(2)} days`;
            if (seconds < 3153600000) return `${(seconds/31536000).toFixed(2)} years`;
            return `${(seconds/31536000).toFixed(2)} years`;
        }

        function checkPassword() {
            const password = document.getElementById('passwordInput').value;
            const strengthDiv = document.getElementById('strength');
            if (!password) {
                strengthDiv.innerHTML = '';
                strengthDiv.classList.remove('show');
                // Clear crack time fields
                document.querySelector('#crackNoAI span').textContent = '--';
                document.querySelector('#crackAI span').textContent = '--';
                return;
            }

            const lengthOK = password.length >= 12;
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);
            const hasDigit = /\d/.test(password);
            const hasSpecial = /[!@#$%^&*()_+\-=\$\${};':"\\|,.<>\/?]/.test(password);

            let score = 0;
            if (lengthOK) score++;
            if (hasUpper) score++;
            if (hasLower) score++;
            if (hasDigit) score++;
            if (hasSpecial) score++;

            let message = '';
            let className = '';
            if (score >= 5) {
                message = 'Great! Your password is very strong and secure.';
                className = 'strong';
            } else if (score >= 3) {
                message = 'Okay, but make it stronger for better security.';
                className = 'medium';
            } else {
                message = 'Weak! Add more characters and types to make it secure.';
                className = 'weak';
            }

            strengthDiv.innerHTML = `<span class="${className}">${message}</span>`;
            strengthDiv.classList.add('show');

            // Crack time estimation
            const crackTimes = estimateCrackTime(password);
            document.querySelector('#crackNoAI span').textContent = crackTimes.noAI;
            document.querySelector('#crackAI span').textContent = crackTimes.AI;
        }

        // Pop-up animation trigger
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('portalBox').classList.add('pop-up');
        });

        // Real-time checking
        document.getElementById('passwordInput').addEventListener('input', () => {
            const genDiv = document.getElementById('generatedPassword');
            if (
                genDiv.textContent !== 'Your generated password will appear here...' &&
                genDiv.textContent !== document.getElementById('passwordInput').value
            ) {
                genDiv.textContent = 'Your generated password will appear here...';
                genDiv.classList.remove('show');
            }
            checkPassword();
        });

        // Initial check
        checkPassword();