// ===== GLOBAL STATE MANAGER =====

class AppState {
  constructor() {
    this.currentUser = null;
    this.authToken = null;
    this.listeners = [];
  }

  setState(newState) {
    this.currentUser = newState.currentUser !== undefined ? newState.currentUser : this.currentUser;
    this.authToken = newState.authToken !== undefined ? newState.authToken : this.authToken;
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this));
  }

  isLoggedIn() {
    return this.currentUser !== null && this.authToken !== null;
  }

  reset() {
    this.currentUser = null;
    this.authToken = null;
    this.notifyListeners();
  }
}

const appState = new AppState();
const API_URL = 'http://localhost:3000/api';

// Subscribe to state changes
appState.subscribe(state => {
  updateAuthHeader();
  if (state.isLoggedIn()) {
    updateUIForUser();
    loadUserStats();
  } else {
    hideUserCards();
  }
});

// ===== UTILITY FUNCTIONS =====

function showError(formType, fieldType, message) {
  try {
    const errorElement = document.getElementById(`${formType}${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}Error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }

    const inputElement = document.getElementById(`${formType}${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`);
    if (inputElement) {
      inputElement.parentElement.classList.add('error');
    }
  } catch (e) {
    console.error('Error showing error:', e);
  }
}

function clearErrorMessages(formType) {
  try {
    const modal = document.getElementById(`${formType}Modal`);
    if (modal) {
      modal.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
      });
      modal.querySelectorAll('.form-group').forEach(el => {
        el.classList.remove('error');
      });
    }
  } catch (e) {
    console.error('Error clearing messages:', e);
  }
}

function showSuccess(formType, message) {
  try {
    const successElement = document.getElementById(`${formType}Success`);
    if (successElement) {
      successElement.textContent = message;
      successElement.classList.add('show');
    }
  } catch (e) {
    console.error('Error showing success:', e);
  }
}

function showLoader(formType, show) {
  try {
    const loader = document.getElementById(`${formType}Loader`);
    if (loader) {
      loader.classList.toggle('show', show);
    }
  } catch (e) {
    console.error('Error toggling loader:', e);
  }
}

function hideUserCards() {
  const cards = ['userStatsCard', 'quickActionsCard', 'badgesCard', 'clanCard'];
  cards.forEach(id => {
    const card = document.getElementById(id);
    if (card) card.style.display = 'none';
  });
}

function updateUIForUser() {
  if (appState.isLoggedIn()) {
    const cards = ['userStatsCard', 'quickActionsCard', 'badgesCard', 'clanCard'];
    cards.forEach(id => {
      const card = document.getElementById(id);
      if (card) card.style.display = 'block';
    });
    loadAllClans();
  } else {
    hideUserCards();
  }
}

// ===== AUTH FUNCTIONS =====

function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('active');
    const registerModal = document.getElementById('registerModal');
    if (registerModal) registerModal.classList.remove('active');
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('active');
  clearLoginForm();
}

function showRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) {
    modal.classList.add('active');
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.remove('active');
  }
  loadPasswordRequirements();
}

function closeRegisterModal() {
  const modal = document.getElementById('registerModal');
  if (modal) modal.classList.remove('active');
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
  const form = document.getElementById('loginForm');
  if (form) form.reset();
  clearErrorMessages('login');
}

function clearRegisterForm() {
  const form = document.getElementById('registerForm');
  if (form) form.reset();
  clearErrorMessages('register');
}

async function handleLogin(e) {
  e.preventDefault();

  const usernameEl = document.getElementById('loginUsername');
  const passwordEl = document.getElementById('loginPassword');
  
  const username = usernameEl ? usernameEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';

  clearErrorMessages('login');
  showLoader('login', true);
  const submitBtn = document.querySelector('#loginForm button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

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
      showError('login', 'username', data.error || 'Errore durante il login');
      return;
    }

    appState.setState({
      currentUser: data.user,
      authToken: data.token
    });

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));

    showSuccess('login', 'Login avvenuto con successo!');

    setTimeout(() => {
      closeLoginModal();
      if (typeof loadTerritories === 'function') loadTerritories();
      if (typeof loadLeaderboard === 'function') loadLeaderboard();
    }, 500);

  } catch (error) {
    showError('login', 'username', 'Errore di connessione: ' + error.message);
  } finally {
    showLoader('login', false);
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const usernameEl = document.getElementById('registerUsername');
  const emailEl = document.getElementById('registerEmail');
  const passwordEl = document.getElementById('registerPassword');
  const confirmPasswordEl = document.getElementById('registerConfirmPassword');

  const username = usernameEl ? usernameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : '';

  clearErrorMessages('register');

  // Validate password strength
  const passwordChecks = [
    { pattern: /.{8,}/, name: 'almeno 8 caratteri' },
    { pattern: /[A-Z]/, name: 'almeno una maiuscola' },
    { pattern: /[a-z]/, name: 'almeno una minuscola' },
    { pattern: /[0-9]/, name: 'almeno un numero' },
    { pattern: /[!@#$%^&*]/, name: 'almeno un carattere speciale' }
  ];

  const failedChecks = passwordChecks.filter(check => !check.pattern.test(password));
  if (failedChecks.length > 0) {
    showError('register', 'password', 'Password: ' + failedChecks.map(c => c.name).join(', '));
    return;
  }

  if (password !== confirmPassword) {
    showError('register', 'confirmPassword', 'Le password non coincidono');
    return;
  }

  showLoader('register', true);
  const submitBtn = document.querySelector('#registerForm button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

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
        const fieldName = data.error.toLowerCase().includes('username') ? 'username' : 'email';
        showError('register', fieldName, data.error);
      } else if (data.requirements) {
        showError('register', 'password', data.requirements[0]);
      }
      return;
    }

    appState.setState({
      currentUser: data.user,
      authToken: data.token
    });

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));

    showSuccess('register', `Benvenuto ${data.user.username}!`);

    setTimeout(() => {
      closeRegisterModal();
      if (typeof loadTerritories === 'function') loadTerritories();
      if (typeof loadLeaderboard === 'function') loadLeaderboard();
    }, 500);

  } catch (error) {
    showError('register', 'email', 'Errore di connessione: ' + error.message);
  } finally {
    showLoader('register', false);
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function loadPasswordRequirements() {
  try {
    const response = await fetch(`${API_URL}/auth/password-requirements`);
    const data = await response.json();

    const requirementsDiv = document.getElementById('passwordRequirements');
    if (!requirementsDiv) return;
    
    requirementsDiv.innerHTML = '';

    const title = document.createElement('strong');
    title.style.color = 'var(--text-primary)';
    title.textContent = 'Requisiti Password:';
    requirementsDiv.appendChild(title);

    const passwordInput = document.getElementById('registerPassword');
    const requirements = data.password_requirements || [];

    requirements.forEach((req) => {
      const div = document.createElement('div');
      div.className = 'requirement';
      div.style.color = 'var(--text-muted)';
      div.style.marginTop = '8px';
      div.innerHTML = `<span class="requirement-icon" style="display:inline-block;margin-right:8px;">○</span> ${req}`;
      requirementsDiv.appendChild(div);
    });

    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        updatePasswordRequirements(passwordInput.value, requirements);
      });
    }

  } catch (error) {
    console.error('Errore nel caricamento dei requisiti:', error);
  }
}

function updatePasswordRequirements(password, requirements) {
  const checks = [
    { pattern: /.{8,}/, name: '8+ characters' },
    { pattern: /[A-Z]/, name: 'uppercase' },
    { pattern: /[a-z]/, name: 'lowercase' },
    { pattern: /[0-9]/, name: 'number' },
    { pattern: /[!@#$%^&*]/, name: 'special char' }
  ];

  const requirementElements = document.querySelectorAll('#passwordRequirements .requirement');
  
  requirementElements.forEach((el, i) => {
    const check = checks[i];
    if (check && check.pattern.test(password)) {
      el.style.color = 'var(--success-color)';
      el.classList.add('met');
      const icon = el.querySelector('.requirement-icon');
      if (icon) icon.textContent = '✓';
    } else if (check) {
      el.style.color = 'var(--text-muted)';
      el.classList.remove('met');
      const icon = el.querySelector('.requirement-icon');
      if (icon) icon.textContent = '○';
    }
  });
}

function updateAuthHeader() {
  try {
    const navButtons = document.getElementById('navButtons');
    if (!navButtons) return;

    if (appState.isLoggedIn()) {
      const initials = appState.currentUser.username.substring(0, 2).toUpperCase();
      navButtons.innerHTML = `
        <div class="user-info">
          <div class="user-avatar">${initials}</div>
          <div class="user-welcome">
            <div class="user-welcome-name">${appState.currentUser.username}</div>
            <div class="user-welcome-level">Livello ${appState.currentUser.level || 1}</div>
          </div>
          <button onclick="handleLogout()" class="btn-secondary btn-small">Esci</button>
        </div>
      `;
    } else {
      navButtons.innerHTML = `
        <button class="btn-secondary btn-small" onclick="showLoginModal()">🔓 Accedi</button>
        <button class="btn-primary btn-small" onclick="showRegisterModal()">✨ Registrati</button>
      `;
    }
  } catch (e) {
    console.error('Error updating header:', e);
  }
}

async function handleLogout() {
  try {
    if (appState.authToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${appState.authToken}`
        }
      });
    }
  } catch (error) {
    console.error('Errore durante il logout:', error);
  }

  appState.reset();
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  hideUserCards();
  if (typeof loadLeaderboard === 'function') loadLeaderboard();
}

function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');

  if (token && user) {
    try {
      appState.setState({
        authToken: token,
        currentUser: JSON.parse(user)
      });
    } catch (e) {
      console.error('Error parsing user:', e);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }
}

// ===== CLAN FUNCTIONS =====

function showClanModal() {
  if (!appState.isLoggedIn()) {
    showLoginModal();
    return;
  }
  const modal = document.getElementById('clanModal');
  if (modal) modal.classList.add('active');
}

function closeClanModal() {
  const modal = document.getElementById('clanModal');
  if (modal) modal.classList.remove('active');
  const form = document.getElementById('clanForm');
  if (form) form.reset();
  clearErrorMessages('clan');
}

async function handleCreateClan(e) {
  e.preventDefault();

  const nameEl = document.getElementById('clanName');
  const descEl = document.getElementById('clanDescription');

  const name = nameEl ? nameEl.value.trim() : '';
  const description = descEl ? descEl.value.trim() : '';

  if (!name || !description) {
    showError('clan', 'name', 'Nome e descrizione sono obbligatori');
    return;
  }

  showLoader('clan', true);
  const submitBtn = document.querySelector('#clanForm button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/clans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': appState.currentUser.id
      },
      body: JSON.stringify({ name, description })
    });

    const data = await response.json();

    if (!response.ok) {
      showError('clan', 'name', data.error || 'Errore nella creazione del clan');
      return;
    }

    showSuccess('clan', 'Clan creato con successo!');
    setTimeout(() => {
      closeClanModal();
      if (typeof loadAllClans === 'function') loadAllClans();
    }, 500);

  } catch (error) {
    showError('clan', 'name', 'Errore di connessione: ' + error.message);
  } finally {
    showLoader('clan', false);
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function joinClan(clanId) {
  if (!appState.isLoggedIn()) {
    showLoginModal();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/clans/${clanId}/join`, {
      method: 'POST',
      headers: {
        'user-id': appState.currentUser.id
      }
    });

    const data = await response.json();

    if (!response.ok) {
      alert('Errore: ' + (data.error || 'Impossibile aderire al clan'));
      return;
    }

    alert('✅ Hai aderito al clan!');
    loadAllClans();
  } catch (error) {
    alert('Errore di connessione: ' + error.message);
  }
}

async function loadAllClans() {
  try {
    const response = await fetch(`${API_URL}/clans`);
    const data = await response.json();
    const clans = data.clans || [];

    const container = document.getElementById('allClansContainer');
    if (!container) return;

    if (clans.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nessun clan disponibile</p>';
      return;
    }

    container.innerHTML = clans.map(clan => `
      <div class="clan-card" style="background: var(--bg-card); padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 3px solid #667eea;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div>
            <h4 style="margin: 0 0 5px 0; color: var(--text-primary);">⚔️ ${clan.name}</h4>
            <p style="margin: 0; color: var(--text-muted); font-size: 0.9em;">${clan.description}</p>
          </div>
          <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.85em; font-weight: 600;">Livello ${clan.level}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; font-size: 0.9em;">
          <div><span style="color: var(--text-muted);">👥 Membri:</span> <span style="color: var(--text-primary); font-weight: 600;">${clan.membersCount || 0}</span></div>
          <div><span style="color: var(--text-muted);">⚡ Exp:</span> <span style="color: var(--text-primary); font-weight: 600;">${clan.experience || 0}</span></div>
          <div><span style="color: var(--text-muted);">📍 Area:</span> <span style="color: var(--text-primary); font-weight: 600;">${clan.totalArea ? (clan.totalArea / 1000).toFixed(1) + 'km²' : '0km²'}</span></div>
        </div>
        <button class="btn-secondary btn-small" onclick="joinClan('${clan.id}')" style="width: 100%;">⚔️ Aderisci al Clan</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Errore caricamento clan:', error);
  }
}

// ===== LEADERBOARD FUNCTIONS =====

function switchLeaderboard(type) {
  const usersLb = document.getElementById('usersLeaderboard');
  const clansLb = document.getElementById('clansLeaderboard');
  
  if (usersLb) usersLb.style.display = type === 'users' ? 'block' : 'none';
  if (clansLb) clansLb.style.display = type === 'clans' ? 'block' : 'none';

  const tabs = document.querySelectorAll('#leaderboardContainer .tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', 
      (type === 'users' && tab.textContent.includes('Giocatori')) ||
      (type === 'clans' && tab.textContent.includes('Clan'))
    );
  });

  if (type === 'clans' && clansLb && !clansLb.dataset.loaded) {
    if (typeof loadClansLeaderboard === 'function') loadClansLeaderboard();
  }
}

function switchModalLeaderboard(type) {
  const playerLb = document.getElementById('modalPlayersLeaderboard');
  const clansLb = document.getElementById('modalClansLeaderboard');
  
  if (playerLb) playerLb.style.display = type === 'players' ? 'block' : 'none';
  if (clansLb) clansLb.style.display = type === 'clans' ? 'block' : 'none';

  const tabs = document.querySelectorAll('#leaderboardModal .tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active',
      (type === 'players' && tab.textContent.includes('Giocatori')) ||
      (type === 'clans' && tab.textContent.includes('Clan'))
    );
  });

  if (type === 'clans' && clansLb && !clansLb.dataset.loaded) {
    if (typeof loadModalClansLeaderboard === 'function') loadModalClansLeaderboard();
  }
}

function showLeaderboardModal() {
  const modal = document.getElementById('leaderboardModal');
  if (modal) {
    modal.classList.add('active');
    if (typeof loadLeaderboard === 'function') loadLeaderboard();
  }
}

function closeLeaderboardModal() {
  const modal = document.getElementById('leaderboardModal');
  if (modal) modal.classList.remove('active');
}

// ===== DATA LOADING FUNCTIONS (STUBS) =====

async function loadUserStats() {
  if (!appState.isLoggedIn()) return;
  console.log('loadUserStats called');
}

async function loadLeaderboard() {
  console.log('loadLeaderboard called');
}

async function loadAllClans() {
  console.log('loadAllClans called');
}

// ===== MODAL CLOSE HANDLERS =====

window.addEventListener('click', function(event) {
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const clanModal = document.getElementById('clanModal');
  const leaderboardModal = document.getElementById('leaderboardModal');

  if (event.target === loginModal && loginModal) loginModal.classList.remove('active');
  if (event.target === registerModal && registerModal) registerModal.classList.remove('active');
  if (event.target === clanModal && clanModal) clanModal.classList.remove('active');
  if (event.target === leaderboardModal && leaderboardModal) leaderboardModal.classList.remove('active');
});

// ===== PAGE INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  const clanForm = document.getElementById('clanForm');
  if (clanForm) {
    clanForm.addEventListener('submit', handleCreateClan);
  }

  checkAuthStatus();
  loadAllClans();
  console.log('App initialized');
});

// ===== TERRITORY CONQUEST FUNCTIONS =====

let conquestMap = null;
let conquestPoints = [];
let conquestPolyline = null;
let conquestMarkers = [];

function showConquestMapModal() {
  if (!appState.isLoggedIn()) {
    showLoginModal();
    return;
  }

  // Controlla ban
  fetch(`${API_URL}/territory-conquests/my/ban-status`, {
    headers: { 'user-id': appState.currentUser.id }
  })
    .then(r => r.json())
    .then(data => {
      if (data.banned) {
        alert(`⛔ Sei bannato! Motivo: ${data.banInfo.reason}\nTempo rimanente: ${Math.ceil(data.timeRemaining / 3600)} ore`);
        return;
      }

      const modal = document.getElementById('conquestMapModal');
      if (modal) {
        modal.classList.add('active');
        conquestPoints = [];
        conquestMarkers = [];
        document.getElementById('conquestDuration').value = '';
        document.getElementById('conquestInfo').style.display = 'none';
        
        setTimeout(() => {
          if (!conquestMap) {
            conquestMap = L.map('conquestMap').setView([45.4642, 9.1900], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors'
            }).addTo(conquestMap);
          }
          conquestMap.invalidateSize();

          conquestMap.off('click');
          conquestMap.on('click', (e) => handleConquestMapClick(e));
        }, 100);
      }
    })
    .catch(err => console.error('Ban check error:', err));
}

function closeConquestMapModal() {
  const modal = document.getElementById('conquestMapModal');
  if (modal) modal.classList.remove('active');
  if (conquestMap) {
    conquestMap.off('click');
  }
  conquestPoints = [];
  conquestMarkers = [];
  if (conquestPolyline) {
    conquestMap.removeLayer(conquestPolyline);
    conquestPolyline = null;
  }
}

function resetConquestPoints() {
  conquestPoints = [];
  conquestMarkers.forEach(marker => conquestMap.removeLayer(marker));
  conquestMarkers = [];
  if (conquestPolyline) {
    conquestMap.removeLayer(conquestPolyline);
    conquestPolyline = null;
  }
  document.getElementById('conquestInfo').style.display = 'none';
  alert('✅ Punti resettati! Puoi ricominciare a cliccare sulla mappa.');
}

function handleConquestMapClick(e) {
  if (conquestPoints.length >= 4) {
    alert('⛔ Hai già selezionato 4 punti! Clicca "Resetta Punti" per ricominciare.');
    return;
  }

  conquestPoints.push(e.latlng);
  const pointNumber = conquestPoints.length;
  const colors = ['#667eea', '#10b981', '#f39c12', '#ef4444'];
  const labels = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

  const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
    radius: 10,
    fillColor: colors[pointNumber - 1],
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
  }).addTo(conquestMap).bindPopup(`${labels[pointNumber - 1]} Punto ${pointNumber}`);

  conquestMarkers.push(marker);
  alert(`✅ Punto ${pointNumber} segnato!`);

  // Quando raggiunge 4 punti, chiudi la mappa ai click e disegna il poligono
  if (conquestPoints.length === 4) {
    conquestMap.off('click');
    
    // Disegna il poligono
    if (conquestPolyline) {
      conquestMap.removeLayer(conquestPolyline);
    }
    
    const pointsArray = conquestPoints.map(p => [p.lat, p.lng]);
    pointsArray.push(pointsArray[0]); // Chiudi il poligono
    
    conquestPolyline = L.polyline(pointsArray, {
      color: '#667eea',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 5'
    }).addTo(conquestMap);

    updateConquestInfo();
    alert('🎯 Territorio definito! Inserisci il tempo impiegato e invia la conquista.');
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function updateConquestInfo() {
  if (conquestPoints.length < 4) return;

  // Calcola perimetro del territorio (distanza totale tra i 4 punti)
  let totalDistance = 0;
  for (let i = 0; i < conquestPoints.length; i++) {
    const currentPoint = conquestPoints[i];
    const nextPoint = conquestPoints[(i + 1) % conquestPoints.length]; // Torna al primo punto alla fine
    const dist = calculateDistance(
      currentPoint.lat,
      currentPoint.lng,
      nextPoint.lat,
      nextPoint.lng
    );
    totalDistance += dist;
  }

  const duration = parseFloat(document.getElementById('conquestDuration').value) || 0;
  const speed = duration > 0 ? (totalDistance / (duration / 60)).toFixed(1) : 0;

  document.getElementById('conquestDistance').textContent = totalDistance.toFixed(2);
  document.getElementById('conquestSpeed').textContent = speed;
  document.getElementById('conquestInfo').style.display = 'block';

  // Avvertenza velocità
  const warning = document.getElementById('conquestWarning');
  if (speed > 60) {
    warning.style.display = 'block';
    warning.innerHTML = `<span>⛔ Velocità impossibile! (${speed} km/h > 60 km/h) - Sarai bannato!</span>`;
  } else if (speed > 0 && speed < 0.5) {
    warning.style.display = 'block';
    warning.innerHTML = `<span>⚠️ Velocità troppo bassa (${speed} km/h)</span>`;
  } else {
    warning.style.display = 'none';
  }
}

function submitConquest() {
  if (conquestPoints.length < 4) {
    alert('Devi selezionare 4 punti sulla mappa per definire il territorio');
    return;
  }

  const duration = parseFloat(document.getElementById('conquestDuration').value);
  if (!duration || duration < 1 || duration > 600) {
    alert('Inserisci una durata valida (1-600 minuti)');
    return;
  }

  document.getElementById('conquestLoader').classList.add('show');

  fetch(`${API_URL}/territory-conquests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': appState.currentUser.id
    },
    body: JSON.stringify({
      points: conquestPoints.map(p => ({ latitude: p.lat, longitude: p.lng })),
      durationMinutes: duration
    })
  })
    .then(r => r.json())
    .then(data => {
      document.getElementById('conquestLoader').classList.remove('show');

      if (data.banned) {
        alert(`⛔ CHEAT RILEVATO!\n${data.error}\n\nSei bannato per 24 ore!`);
        closeConquestMapModal();
        return;
      }

      if (data.conquest) {
        alert(`✅ Conquista inviata per approvazione!\n\n📍 Distanza: ${data.conquest.distance.toFixed(2)} km\n⚡ Velocità: ${data.conquest.calculatedSpeed.toFixed(1)} km/h`);
        closeConquestMapModal();
      } else if (data.error) {
        alert(`❌ Errore: ${data.error}`);
      }
    })
    .catch(err => {
      document.getElementById('conquestLoader').classList.remove('show');
      alert('Errore di connessione: ' + err.message);
    });
}

// Make functions globally available
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.showRegisterModal = showRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.toggleToRegister = toggleToRegister;
window.toggleToLogin = toggleToLogin;
window.handleLogout = handleLogout;
window.showConquestMapModal = showConquestMapModal;
window.closeConquestMapModal = closeConquestMapModal;
window.submitConquest = submitConquest;
window.resetConquestPoints = resetConquestPoints;
window.showClanModal = showClanModal;
window.closeClanModal = closeClanModal;
window.joinClan = joinClan;
window.switchLeaderboard = switchLeaderboard;
window.switchModalLeaderboard = switchModalLeaderboard;
window.showLeaderboardModal = showLeaderboardModal;
window.closeLeaderboardModal = closeLeaderboardModal;
