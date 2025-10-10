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

        function checkPassword() {
            const password = document.getElementById('passwordInput').value;
            const strengthDiv = document.getElementById('strength');
            if (!password) {
                strengthDiv.innerHTML = '';
                strengthDiv.classList.remove('show');
                return;
            }

            const length = password.length >= 12;
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);
            const hasDigit = /\d/.test(password);
            const hasSpecial = /[!@#$%^&*()_+\-=\$\${};':"\\|,.<>\/?]/.test(password);

            let score = 0;
            if (length) score++;
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
        }

        // Pop-up animation trigger
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('portalBox').classList.add('pop-up');
        });

        // Real-time checking
        document.getElementById('passwordInput').addEventListener('input', () => {
            const genDiv = document.getElementById('generatedPassword');
            if (genDiv.textContent !== 'Your generated password will appear here...' && genDiv.textContent !== document.getElementById('passwordInput').value) {
                genDiv.textContent = 'Your generated password will appear here...';
                genDiv.classList.remove('show');
            }
            checkPassword();
        });

        // Initial check
        checkPassword();