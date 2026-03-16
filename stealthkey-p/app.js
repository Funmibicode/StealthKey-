// ============================================
// app.js
// --------------------------------------------
// This is the MAIN CONTROLLER of the entire app.
// It is the only file that reads from input fields
// and listens for button clicks.
//
// It is responsible for:
// 1. Creating the Vault instance when the app starts
// 2. Handling the unlock and lock button
// 3. Listening for the ADD ENTRY button click
// 4. Reading the input field values and passing them to Vault
// 5. Handling edit and delete actions on each card
// 6. Triggering the password generator
// 7. Connecting search and filter to the UI
// 8. Telling UI to re-render after any data change
//
// Think of it as the MANAGER that coordinates
// between the user, the UI, and the Vault.
// ============================================


// Step 1 - create a vault instance
// Step 2 - when page loads, call vault.load() then UI.renderList()
// Step 3 - bind all button click events here
// Step 4 - on unlock, hide lock screen and show app
// Step 5 - on add/save, read inputs → vault.add() → UI.renderList()
// Step 6 - on delete, vault.delete() → UI.renderList()
// Step 7 - on edit, open modal with existing data → → UI.renderList()
// Step 8 - on generate, call Generator.generate() → show result in UI

const vault = new Vault();
  vault.load();
  UI.renderList();
  UI.updateStats();

let activeEntry = null;
let cryptoKey = null;

const unlockBtn = document.getElementById('unlock-btn');
const masterPassword = document.getElementById('master-password');
const lockScreen = document.getElementById('lock-screen');
const app = document.getElementById('app');

unlockBtn.addEventListener('click', async function() {
  const passwordValue = masterPassword.value;

  if (passwordValue === '') {
    alert('Please enter your master password');
    return;
  }

  const salt = Encryption.getOrCreateSalt();
  cryptoKey = await Encryption.deriveKey(passwordValue, salt);

  // First time — create test value
  if (!localStorage.getItem('sk_verify')) {
    const testValue = await Encryption.encrypt('stealthkey_test', cryptoKey);
    localStorage.setItem('sk_verify', testValue);
  } else {
    // Not first time — verify password is correct
    try {
      const verify = localStorage.getItem('sk_verify');
      await Encryption.decrypt(verify, cryptoKey);
    } catch(e) {
      alert('Incorrect master password');
      cryptoKey = null;
      return;
    }
  }

  lockScreen.classList.add('hidden');
  app.classList.remove('hidden');
  vault.load();
  UI.renderList();
});


function lockVault() {
  lockScreen.classList.remove('hidden');
  app.classList.add('hidden');
  cryptoKey = null;
}

document.getElementById('lock-btn').addEventListener('click', lockVault);
document.getElementById('lock-btn-mobile').addEventListener('click', lockVault);


document.getElementById('reset-btn').addEventListener('click', function() {
  if (confirm('This will delete all saved passwords. Are you sure?')) {
    localStorage.clear();
    location.reload();
  }
});

// Add password 
const addBtn = document.getElementById('add-btn');
const addModal = document.getElementById('modal-overlay');
const closeModal = document.getElementById('modal-close');

UI.openModal(addBtn);

UI.closeModal(closeModal);



// Cancle Button 
document.getElementById('cancel-modal-btn').addEventListener('click', clearInput);



// Save entry
const saveEntry = document.getElementById('save-entry-btn');

saveEntry.addEventListener('click',
 async function () {
    const siteName = document.getElementById('entry-site').value;
    const userName = document.getElementById('entry-username').value;
    const password = document.getElementById('entry-password').value;
    const entryError = document.getElementById('entry-error');
    
    entryError.textContent = '';
    
    const urlPattern = /^[a-z0-9-]+(\.[a-z]{2,})+$/i;
    
    let isValid = true;
    
    if (siteName === ''|| !urlPattern.test(siteName)) {
      entryError.textContent = 'input a valid site name';
      isValid = false;
    }
    else if(userName === ''){
      entryError.textContent = 'input your user name';
      isValid = false;
    }
    else if (password === '' || password.length < 5) {
      entryError.textContent = 'Password must be atleast 5 chara';
      isValid = false;
    }
    
    if (!isValid) {
      return
    }
    
    
    const encryptedPassword = await Encryption.encrypt(password, cryptoKey);
  
    if (activeEntry) {
      vault.update(activeEditId, siteName, userName, encryptedPassword);
      activeEditId = null;
    } else {
      vault.add(siteName, userName, encryptedPassword);
    }
    
    UI.renderList();
    UI.updateStats();
    
    clearInput();
    
  }
);

//Delegation event on actions button 
document.getElementById('password-list').addEventListener('click', async function(e) {
  
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');
  const copyBtn = e.target.closest('.copy-btn');
  
  const deleteOverlay = document.getElementById('delete-overlay');
  const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
  const deleteCancelBtn = document.getElementById('delete-cancel-btn');
  const deleteCancelX = document.getElementById('delete-cancel');

// When delete button on card is clicked
if (deleteBtn) {
  const id = deleteBtn.dataset.id;
  const entry = vault.getById(id);
  
  activeDeleteId = id;
  
  // show site name in overlay
  document.getElementById('delete-site-name').textContent = entry.site;
  
  deleteOverlay.classList.remove('hidden');
  }

// Confirm delete
  deleteConfirmBtn.addEventListener('click', function() {
  if (activeDeleteId) {
    vault.delete(activeDeleteId);
    UI.renderList();
    UI.updateStats();
    activeDeleteId = null;
    deleteOverlay.classList.add('hidden');
  }
  });

// Cancel delete
  deleteCancelBtn.addEventListener('click',  function() {
    activeDeleteId = null;
    deleteOverlay.classList.add('hidden');
  });

  deleteCancelX.addEventListener('click', function() {
  activeDeleteId = null;
  deleteOverlay.classList.add('hidden');
  
  });
  
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
  
  // decrypt password before showing it
    const decryptedPassword = await Encryption.decrypt(entry.password, cryptoKey);
  
    document.getElementById('entry-site').value = entry.site;
    document.getElementById('entry-username').value = entry.username;
    document.getElementById('entry-password').value = decryptedPassword;
  
    document.getElementById('save-entry-btn').textContent = 'EDIT ENTRY';
    document.getElementById('modal-title').textContent = 'EDIT ENTRY';
  
    addModal.classList.remove('hidden');
  UI.updateStats();
  }
  
  // Accordion - expand card on click
  const card = e.target.closest('.pw-card');
  const pwToggle = e.target.closest('.card-pw-toggle');

  if (card && !deleteBtn && !editBtn && !copyBtn && !pwToggle) {
  const isExpanded = card.classList.contains('expanded');

  // close all cards first
  document.querySelectorAll('.pw-card').forEach(c => {
    c.classList.remove('expanded');
  });

  // if it wasn't open, open it
  if (!isExpanded) {
    card.classList.add('expanded');
  }
  }
  

  if (pwToggle) {
    const card = pwToggle.closest('.pw-card');
    const input = card.querySelector('input[type="password"], input[type="text"]');
  
  if (input.type === 'password') {
    const id = card.dataset.id;
    const entry = vault.getById(id);
    const decryptedPassword = await Encryption.decrypt(entry.password, cryptoKey);
    input.value = decryptedPassword;
    input.type = 'text';
  } else {
    input.value = '••••••••••••';
    input.type = 'password';
  }
}
  
});





function clearInput(){
    document.getElementById('entry-site').value ='' ;
    document.getElementById('entry-username').value = '';
    document.getElementById('entry-password').value = '';
    document.getElementById('modal-strength-bar').classList.remove('weak','medium','strong');
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('save-entry-btn').textContent = 'SAVE ENTRY';
    document.getElementById('modal-title').textContent = 'ADD ENTRY';
}


const passwordInput = document.getElementById('entry-password');
const strengthBar = document.getElementById('modal-strength-bar');
// Listen for typing
passwordInput.addEventListener('input', function() {
    // Pass the current value to your UI method
    UI.updateStrengthBar(strengthBar, passwordInput.value);
});


// Show password 
const togglePasswordInput = document.getElementById('toggle-visible');

togglePasswordInput.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    
    passwordInput.type = isPassword ? 'text' : 'password';
    
});


//Switch pages
const navBtn = document.querySelectorAll('nav .nav-item');

navBtn.forEach(function(btn) {
  btn.addEventListener('click', function() {
      navBtn.forEach((btnEl) => {
                btnEl.classList.remove('active');
      });
      btn.classList.add('active');
      
        const target = btn.dataset.view; 
        
      
        
      UI.switchView(target);
    });
});



//Generate password 
document.getElementById('generate-btn').addEventListener('click',
  function () {
    
    const length = document.getElementById('gen-length').value;
    let uppercase = document.getElementById('opt-upper');
    let lowercase = document.getElementById('opt-lower');
    let numbers = document.getElementById('opt-numbers');
    let symbols = document.getElementById('opt-symbols');
    let strengthBar = document.getElementById('strength-bar');
    let strengthLabel = document.getElementById('strength-label');
    
    
    
    let width = '0%';
    let checked = 0;
    strengthLabel.textContent ='';
    
    if (uppercase.checked) {
      checked++;
    } if (lowercase.checked) {
      checked++;
    } if (numbers.checked) {
      checked++;
    } if (symbols.checked) {
      checked++;
    }
    
    
    strengthBar.classList.remove('weak','medium','strong');
    
    if(checked === 4){
      width = '100%';
      strengthBar.classList.add('strong');
      strengthLabel.textContent = 'Strong';
    }
    else if(checked === 3) {
      width = '66%';
      strengthBar.classList.add('medium');
      strengthLabel.textContent = 'Medium';
    }
    else if (checked === 2) {
      width = '33%';
      strengthBar.classList.add('weak');  
      strengthLabel.textContent = 'Weak';
    }
    else if (checked === 1) {
      width = '5%';
      strengthBar.classList.add('weak');
      strengthLabel.textContent = 'Password is too weak to use';
    }
    
    strengthBar.style.width = width;
    
   const generatedPassword =  Generator.generate({
      length: length,
      uppercase: uppercase.checked,
      lowercase: lowercase.checked,
      numbers: numbers.checked,
      symbols: symbols.checked,
    });
    
    document.getElementById('gen-output').textContent = generatedPassword;
})

//Display length value
document.getElementById('gen-length').addEventListener('input',
    function () {
    
    let length = document.getElementById('gen-length');
    
    let lenDisplay = document.getElementById('len-display').textContent = `${length.value}`;
    
});

//Copy text to clipboard 

document.getElementById('copy-gen-btn').addEventListener('click', () => {
  const genPassword = document.getElementById('gen-output').innerText;
  
    navigator.clipboard.writeText(genPassword);
});

//Use generated password 
document.getElementById('use-generated-btn').addEventListener('click', () => {
   const generatedPassword =  Generator.generate({
      length: 8,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    
    passwordInput.value = `${generatedPassword}`;
    
  
    
      let modalStrengthBar = document.getElementById('modal-strength-bar');
      
      modalStrengthBar.classList.remove('weak','medium','strong');
      
      modalStrengthBar.style.width = '100%';
      modalStrengthBar.classList.add('strong');
    
});


//Search and Filter button 
const searchInput = document.getElementById('search-input');
const strengthFilter = document.getElementById('filter-select');

[searchInput, strengthFilter].forEach(el => {
  el.addEventListener('input', () => {
    // Re-render using the current values of both inputs
    UI.renderList(searchInput.value.toLowerCase(), strengthFilter.value);
  });
});