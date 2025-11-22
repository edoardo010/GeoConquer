const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let authToken = null;

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('registerModal').classList.remove('active');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    clearLoginForm();
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
    document.getElementById('loginModal').classList.remove('active');
    loadPasswordRequirements();
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('active');
    clearRegisterForm();
}

function toggleToRegister() {
    closeLoginModal();
    showRegisterModal();
}

function toggleToLogin() {
    closeRegisterModal();
    showLoginModal();
}

function clearLoginForm() {
    document.getElementById('loginForm').reset();
    document.querySelectorAll('#loginModal .error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

function clearRegisterForm() {
    document.getElementById('registerForm').reset();
    document.querySelectorAll('#registerModal .error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    clearErrorMessages('login');
    showLoader('login', true);
    document.querySelector('#loginForm button[type="submit"]').disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error) {
                showError('login', 'login', data.error);
            } else {
                showError('login', 'login', 'Errore durante il login');
            }
            return;
        }

        authToken = data.token;
        currentUser = data.user;

        showSuccess('login', 'Login avvenuto con successo! Reindirizzamento...');
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        setTimeout(() => {
            closeLoginModal();
            updateAuthHeader();
            location.reload();
        }, 1500);

    } catch (error) {
        showError('login', 'login', 'Errore di connessione: ' + error.message);
    } finally {
        showLoader('login', false);
        document.querySelector('#loginForm button[type="submit"]').disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    clearErrorMessages('register');

    if (password !== confirmPassword) {
        showError('register', 'confirmPassword', 'Le password non coincidono');
        return;
    }

    showLoader('register', true);
    document.querySelector('#registerForm button[type="submit"]').disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                email,
                password,
                confirmPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error) {
                showError('register', 'email', data.error);
            } else if (data.requirements) {
                showError('register', 'password', data.requirements[0]);
            } else {
                showError('register', 'email', 'Errore durante la registrazione');
            }
            return;
        }

        authToken = data.token;
        currentUser = data.user;

        showSuccess('register', `Benvenuto ${data.user.username}! Accesso effettuato...`);

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        setTimeout(() => {
            closeRegisterModal();
            updateAuthHeader();
            location.reload();
        }, 1500);

    } catch (error) {
        showError('register', 'email', 'Errore di connessione: ' + error.message);
    } finally {
        showLoader('register', false);
        document.querySelector('#registerForm button[type="submit"]').disabled = false;
    }
}

async function loadPasswordRequirements() {
    try {
        const response = await fetch(`${API_URL}/auth/password-requirements`);
        const data = await response.json();

        const requirementsDiv = document.getElementById('passwordRequirements');
        requirementsDiv.innerHTML = '<strong>Requisiti della Password:</strong><br>';

        const passwordInput = document.getElementById('registerPassword');
        const requirements = data.password_requirements || [];

        requirements.forEach(req => {
            const div = document.createElement('div');
            div.className = 'requirement';
            div.innerHTML = `<span class="requirement-icon">○</span> ${req}`;
            requirementsDiv.appendChild(div);
        });

        passwordInput.addEventListener('input', () => {
            updatePasswordRequirements(passwordInput.value, requirements);
        });

    } catch (error) {
        console.error('Errore nel caricamento dei requisiti:', error);
    }
}

function updatePasswordRequirements(password, requirements) {
    const checks = [
        { pattern: /.{8,}/, index: 0 },
        { pattern: /[A-Z]/, index: 1 },
        { pattern: /[a-z]/, index: 2 },
        { pattern: /[0-9]/, index: 3 },
        { pattern: /[!@#$%^&*]/, index: 4 }
    ];

    document.querySelectorAll('#passwordRequirements .requirement').forEach((el, i) => {
        if (i > 0) {
            if (checks[i - 1].pattern.test(password)) {
                el.classList.add('met');
                el.querySelector('.requirement-icon').textContent = '✓';
            } else {
                el.classList.remove('met');
                el.querySelector('.requirement-icon').textContent = '○';
            }
        }
    });
}

function showError(formType, fieldType, message) {
    const errorElement = document.getElementById(`${formType}${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    const inputElement = document.getElementById(`${formType}${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`);
    if (inputElement) {
        inputElement.parentElement.classList.add('error');
    }
}

function clearErrorMessages(formType) {
    document.querySelectorAll(`#${formType}Modal .error-message`).forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
    document.querySelectorAll(`#${formType}Modal .form-group`).forEach(el => {
        el.classList.remove('error');
    });
}

function showSuccess(formType, message) {
    const successElement = document.getElementById(`${formType}Success`);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.add('show');
    }
}

function showLoader(formType, show) {
    const loader = document.getElementById(`${formType}Loader`);
    if (loader) {
        if (show) {
            loader.classList.add('show');
        } else {
            loader.classList.remove('show');
        }
    }
}

function updateAuthHeader() {
    const authHeader = document.getElementById('authHeader');
    const authButtons = authHeader.querySelector('.auth-buttons');

    if (currentUser) {
        authButtons.innerHTML = `
            <div class="user-info">
                <span class="user-welcome">Benvenuto, ${currentUser.username}!</span>
                <button onclick="handleLogout()" class="btn-secondary">Esci</button>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <button onclick="showLoginModal()">Accedi</button>
            <button onclick="showRegisterModal()">Registrati</button>
        `;
    }
}

async function handleLogout() {
    try {
        if (authToken) {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        }
    } catch (error) {
        console.error('Errore durante il logout:', error);
    }

    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');

    updateAuthHeader();
    location.reload();
}

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateAuthHeader();
    }
}

document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

window.addEventListener('load', () => {
    checkAuthStatus();
});

window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === registerModal) {
        closeRegisterModal();
    }
};
