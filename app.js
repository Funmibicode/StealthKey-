// ============================================
// app.js — Main Controller
// ============================================

const vault = new Vault();
let existingSession = null;
let activeEditId = null;
let activeDeleteId = null;
let cryptoKey = null;
let isRegisterMode = false;

const unlockBtn = document.getElementById('unlock-btn');
const masterPassword = document.getElementById('master-password');
const lockScreen = document.getElementById('lock-screen');
const app = document.getElementById('app');
const addModal = document.getElementById('modal-overlay');
const passwordInput = document.getElementById('entry-password');
const strengthBar = document.getElementById('modal-strength-bar');
const searchInput = document.getElementById('search-input');
const strengthFilter = document.getElementById('filter-select');

// ── INIT ──
async function init() {
  const { data } = await supabaseClient.auth.getSession();
  existingSession = data.session;

  if (existingSession) {
    document.getElementById('user-email').classList.add('hidden');
    document.querySelector('label[for="user-email"]').classList.add('hidden');
    document.getElementById('auth-toggle-link').classList.add('hidden');
    document.querySelector('.forget').classList.add('hidden');
    document.getElementById('reset-btn').classList.add('hidden');
  }
}

init();

// ── UNLOCK ──
unlockBtn.addEventListener('click', async function() {
  const passwordValue = masterPassword.value;

  if (passwordValue === '') {
    showAuthError('Please enter your master password');
    return;
  }

  if (existingSession) {
    const salt = Encryption.getOrCreateSalt();
    cryptoKey = await Encryption.deriveKey(passwordValue, salt);

    try {
      const verify = localStorage.getItem('sk_verify');
      await Encryption.decrypt(verify, cryptoKey);
    } catch(e) {
      showAuthError('Incorrect master password');
      cryptoKey = null;
      return;
    }

    lockScreen.classList.add('hidden');
    startInactivityTimer();
    app.classList.remove('hidden');
    await vault.load();
    UI.renderList();
    UI.updateStats();

  } else {
    const email = document.getElementById('user-email').value;

    if (email === '') {
      showAuthError('Please fill in all fields');
      return;
    }

    if (isRegisterMode) {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: passwordValue,
        options: {
          emailRedirectTo: 'https://stealth-key.vercel.app'
        }
      });

      if (error) {
        showAuthError(error.message);
        return;
      }

      showAuthError('Account created! Check your email to verify');

    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: passwordValue
      });

      if (error) {
        showAuthError(error.message);
        return;
      }

      const salt = Encryption.getOrCreateSalt();
      cryptoKey = await Encryption.deriveKey(passwordValue, salt);

      // First time — create verify token
      if (!localStorage.getItem('sk_verify')) {
        const testValue = await Encryption.encrypt('stealthkey_test', cryptoKey);
        localStorage.setItem('sk_verify', testValue);
      }

      lockScreen.classList.add('hidden');
      app.classList.remove('hidden');
      await vault.load();
      UI.renderList();
      UI.updateStats();
    }
  }
});

// ── AUTO LOCK ──
let inactivityTimer = null;
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes in milliseconds

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    lockVault();
  }, INACTIVITY_LIMIT);
}

function startInactivityTimer() {
  ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
  });
  resetInactivityTimer();
}

function stopInactivityTimer() {
  clearTimeout(inactivityTimer);
  ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.removeEventListener(event, resetInactivityTimer);
  });
}

//Google auth
document.getElementById('google-btn').addEventListener('click', async function() {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://your-vercel-url.vercel.app'
    }
  });

  if (error) {
    showAuthError(error.message);
  }
  });

// ── LOCK ──
function lockVault() {
  lockScreen.classList.remove('hidden');
  stopInactivityTimer();
  app.classList.add('hidden');
  cryptoKey = null;
  existingSession = null;

  document.getElementById('user-email').classList.remove('hidden');
  document.querySelector('label[for="user-email"]').classList.remove('hidden');
  document.getElementById('auth-toggle-link').classList.remove('hidden');
  document.querySelector('.forget').classList.remove('hidden');
  document.getElementById('reset-btn').classList.remove('hidden');
}

document.getElementById('lock-btn').addEventListener('click', lockVault);
document.getElementById('lock-btn-mobile').addEventListener('click', lockVault);

// ── RESET ──
document.getElementById('reset-btn').addEventListener('click', function() {
  if (confirm('This will delete all saved passwords. Are you sure?')) {
    localStorage.clear();
    location.reload();
  }
});

// ── AUTH TOGGLE ──
document.getElementById('auth-toggle-link').addEventListener('click', function() {
  isRegisterMode = !isRegisterMode;

  document.getElementById('confirm-password-wrap').classList.toggle('hidden');
  document.getElementById('unlock-btn').textContent = isRegisterMode ? 'CREATE VAULT' : 'UNLOCK VAULT';
  document.getElementById('auth-toggle-link').textContent = isRegisterMode ? 'Sign in instead' : 'Create an account';
  document.querySelector('.forget').classList.toggle('hidden');
  document.getElementById('reset-btn').classList.toggle('hidden');
});

// ── MODAL OPEN/CLOSE ──
document.getElementById('add-btn').addEventListener('click', () => {
  addModal.classList.remove('hidden');
});

document.getElementById('modal-close').addEventListener('click', clearInput);
document.getElementById('cancel-modal-btn').addEventListener('click', clearInput);

// ── SAVE ENTRY ──
document.getElementById('save-entry-btn').addEventListener('click', async function() {
  const siteName = document.getElementById('entry-site').value;
  const userName = document.getElementById('entry-username').value;
  const password = passwordInput.value;
  const entryError = document.getElementById('entry-error');

  entryError.textContent = '';

  const urlPattern = /^[a-z0-9-]+(\.[a-z]{2,})+$/i;
  let isValid = true;

  if (siteName === '' || !urlPattern.test(siteName)) {
    entryError.textContent = 'Input a valid site name';
    isValid = false;
  } else if (userName === '') {
    entryError.textContent = 'Input your username';
    isValid = false;
  } else if (password === '' || password.length < 5) {
    entryError.textContent = 'Password must be at least 5 characters';
    isValid = false;
  }

  if (!isValid) return;

  const strength = Password.score(password);
  const encryptedPassword = await Encryption.encrypt(password, cryptoKey);

  if (activeEditId) {
    await vault.update(activeEditId, siteName, userName, encryptedPassword, strength);
    activeEditId = null;
  } else {
    await vault.add(siteName, userName, encryptedPassword, strength);
  }

  UI.renderList();
  UI.updateStats();
  clearInput();
});

// ── CARD ACTIONS (event delegation) ──
document.getElementById('password-list').addEventListener('click', async function(e) {
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');
  const copyBtn = e.target.closest('.copy-btn');
  const pwToggle = e.target.closest('.card-pw-toggle');
  const card = e.target.closest('.pw-card');

  const deleteOverlay = document.getElementById('delete-overlay');

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const entry = vault.getById(id);
    activeDeleteId = id;
    document.getElementById('delete-site-name').textContent = entry.site;
    deleteOverlay.classList.remove('hidden');
  }

  if (copyBtn) {
    const id = copyBtn.dataset.id;
    const entry = vault.getById(id);
    const decryptedPassword = await Encryption.decrypt(entry.password, cryptoKey);
    navigator.clipboard.writeText(decryptedPassword);
  }

  if (editBtn) {
    const id = editBtn.dataset.id;
    const entry = vault.getById(id);
    activeEditId = id;

    const decryptedPassword = await Encryption.decrypt(entry.password, cryptoKey);

    document.getElementById('entry-site').value = entry.site;
    document.getElementById('entry-username').value = entry.username;
    passwordInput.value = decryptedPassword;

    document.getElementById('save-entry-btn').textContent = 'EDIT ENTRY';
    document.getElementById('modal-title').textContent = 'EDIT ENTRY';
    addModal.classList.remove('hidden');
  }

  // Accordion
  if (card && !deleteBtn && !editBtn && !copyBtn && !pwToggle) {
    const isExpanded = card.classList.contains('expanded');
    document.querySelectorAll('.pw-card').forEach(c => c.classList.remove('expanded'));
    if (!isExpanded) card.classList.add('expanded');
  }

  // Password toggle in expanded card
  if (pwToggle) {
    const parentCard = pwToggle.closest('.pw-card');
    const input = parentCard.querySelector('input[type="password"], input[type="text"]');

    if (input.type === 'password') {
      const id = parentCard.dataset.id;
      const entry = vault.getById(id);
      const decryptedPassword = await Encryption.decrypt(entry.password, cryptoKey);
      input.value = decryptedPassword;
      input.type = 'text';
    } else {
      input.value = '•••••••••';
      input.type = 'password';
    }
  }
});

// ── DELETE OVERLAY ──
document.getElementById('delete-confirm-btn').addEventListener('click', async function() {
  if (activeDeleteId) {
    await vault.delete(activeDeleteId);
    UI.renderList();
    UI.updateStats();
    activeDeleteId = null;
    document.getElementById('delete-overlay').classList.add('hidden');
  }
});

document.getElementById('delete-cancel-btn').addEventListener('click', function() {
  activeDeleteId = null;
  document.getElementById('delete-overlay').classList.add('hidden');
});

document.getElementById('delete-cancel').addEventListener('click', function() {
  activeDeleteId = null;
  document.getElementById('delete-overlay').classList.add('hidden');
});

// ── CLEAR INPUT ──
function clearInput() {
  document.getElementById('entry-site').value = '';
  document.getElementById('entry-username').value = '';
  passwordInput.value = '';
  strengthBar.classList.remove('weak', 'medium', 'strong');
  strengthBar.style.width = '0%';
  addModal.classList.add('hidden');
  document.getElementById('save-entry-btn').textContent = 'SAVE ENTRY';
  document.getElementById('modal-title').textContent = 'ADD ENTRY';
  document.getElementById('entry-error').textContent = '';
}

// ── STRENGTH BAR (modal) ──
passwordInput.addEventListener('input', function() {
  UI.updateStrengthBar(strengthBar, passwordInput.value);
});

// ── SHOW/HIDE PASSWORD (modal) ──
document.getElementById('toggle-visible').addEventListener('click', function() {
  passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
});

// ── NAV SWITCH ──
document.querySelectorAll('nav .nav-item').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('nav .nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    UI.switchView(btn.dataset.view);
  });
});

// ── GENERATOR ──
document.getElementById('generate-btn').addEventListener('click', function() {
  const length = document.getElementById('gen-length').value;
  const uppercase = document.getElementById('opt-upper');
  const lowercase = document.getElementById('opt-lower');
  const numbers = document.getElementById('opt-numbers');
  const symbols = document.getElementById('opt-symbols');
  const genStrengthBar = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');
  const genOutput = document.getElementById('gen-output');

  const generatedPassword = Generator.generate({
    length: length,
    uppercase: uppercase.checked,
    lowercase: lowercase.checked,
    numbers: numbers.checked,
    symbols: symbols.checked,
  });

  genOutput.textContent = generatedPassword;

  const passwordScore = Password.score(generatedPassword);
  genStrengthBar.classList.remove('weak', 'medium', 'strong');
  genStrengthBar.classList.add(passwordScore);

  const widths = { weak: '33%', medium: '66%', strong: '100%' };
  genStrengthBar.style.width = widths[passwordScore];

  const labels = { weak: 'Weak', medium: 'Medium', strong: 'Strong' };
  strengthLabel.textContent = labels[passwordScore];
});

// ── LENGTH DISPLAY ──
document.getElementById('gen-length').addEventListener('input', function() {
  document.getElementById('len-display').textContent = this.value;
});

// ── COPY GENERATED PASSWORD ──
document.getElementById('copy-gen-btn').addEventListener('click', () => {
  const genPassword = document.getElementById('gen-output').innerText;
  navigator.clipboard.writeText(genPassword);
});

// ── USE GENERATED PASSWORD ──
document.getElementById('use-generated-btn').addEventListener('click', () => {
  const generatedPassword = Generator.generate({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  passwordInput.value = generatedPassword;

  const passwordScore = Password.score(generatedPassword);
  strengthBar.classList.remove('weak', 'medium', 'strong');
  strengthBar.classList.add(passwordScore);

  const widths = { weak: '33%', medium: '66%', strong: '100%' };
  strengthBar.style.width = widths[passwordScore];
});

// ── SEARCH & FILTER ──
[searchInput, strengthFilter].forEach(el => {
  el.addEventListener('input', () => {
    UI.renderList(searchInput.value.toLowerCase(), strengthFilter.value);
  });
});

// ── AUTH ERROR TOAST ──
function showAuthError(message) {
  const toast = document.getElementById('auth-toast');
  const msg = document.getElementById('auth-toast-msg');

  msg.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, 3000);
}
