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
// Step 7 - on edit, open modal with existing data → vault.update() → UI.renderList()
// Step 8 - on generate, call Generator.generate() → show result in UI

const vault = new Vault();

const unlockBtn = document.getElementById('unlock-btn');
const masterPassword = document.getElementById('master-password');
const lockScreen = document.getElementById('lock-screen');
const app = document.getElementById('app');

unlockBtn.addEventListener('click', function() {
  const passwordValue = masterPassword.value;

  if (passwordValue === '') {
    alert('Please enter your master password');
    return;
  }

  lockScreen.classList.add('hidden');
  app.classList.remove('hidden');
});



// Add password 
const addBtn = document.getElementById('add-btn');
const addModal = document.getElementById('modal-overlay');
const closModal = document.getElementById('modal-close');

addBtn.addEventListener('click',
  function () {
    if (addModal) {
      addModal.classList.remove('hidden');
    }
  }
);

closModal.addEventListener('click',
  function () {
    if (!addModal.classList.contains('hidden')) {
      addModal.classList.add('hidden');
    }
    clearInput();
  }
);

// Cancle Button 
document.getElementById('cancel-modal-btn').addEventListener('click', clearInput);



// Save entry
const saveEntry = document.getElementById('save-entry-btn');

saveEntry.addEventListener('click',
  function () {
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
    
    console.log(vault.add(siteName,userName,password));
    
    clearInput();
    
  }
)




function clearInput(){
    document.getElementById('entry-site').value ='' ;
    document.getElementById('entry-username').value = '';
    document.getElementById('entry-password').value = '';
    document.getElementById('modal-strength-bar').style.backgroundColor = "#1e3324";
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

document.getElementById('gen-length').addEventListener('input',
    function () {
    
    let length = document.getElementById('gen-length');
    
    let lenDisplay = document.getElementById('len-display').textContent = `${length.value}`;
    
});