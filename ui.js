// ============================================
// ui.js
// --------------------------------------------
// This file handles everything the USER SEES on screen.
// It reads data from Vault and builds the HTML for it.
// It also handles visual feedback like toasts and strength bars.
//
// It is responsible for:
// 1. Rendering the list of password cards on screen
// 2. Building a single password card element
// 3. Opening and closing the add/edit modal
// 4. Showing toast notifications (success/error messages)
// 5. Updating the strength bar as the user types a password
// 6. Switching between the Vault view and Generator view
// 7. Updating the stats (total stored, weak count)
//
// It READS from vault.entries to display data.
// It does NOT save, delete or modify any data itself.
// That is app.js and Vault.js's job.
// ============================================

const UI = {

  // Loops through vault entries and renders password cards on screen
  renderList(searchTerm = '', filterStrength = 'all') {
  const list = document.getElementById('password-list');
  const emptyState = document.getElementById('empty-state');

  // clear old cards first
  list.querySelectorAll('.pw-card').forEach(card => card.remove());

  // get filtered results
  const results = vault.search(searchTerm).filter(entry =>
    filterStrength === 'all' || entry.strength === filterStrength
  );
  
  

  if (results.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  results.forEach(entry => {
    const card = this.buildCard(entry);
    list.appendChild(card);
  });
},
  // Builds and returns a single password card HTML element
  buildCard(entry) {
    const card = document.createElement('div');
    card.className = 'pw-card';
    card.dataset.id = entry.id;

    card.innerHTML = `
      <div class="card-site-icon">${entry.site[0]}</div>
      <div class="card-info">
      <span class="card-site">${entry.site}</span>
      <span class="card-username">${entry.username}</span>
      </div>
      <div class="card-right">
      <div class="card-strength-dot ${entry.strength}"></div>
      <div class="card-actions">
        <button class="icon-btn copy-btn" data-id="${entry.id}">⎘</button>
        <button class="icon-btn edit-btn" data-id="${entry.id}">✎</button>
        <button class="icon-btn danger delete-btn" data-id="${entry.id}">✕</button>
      </div>
      </div>
      
      <div class="pw-card-details">
        <div>
        <p class="detail-label">PASSWORD</p>
        <div class="input-wrap">
        <input type="password" value="${entry.password}" readonly id="pw-field-${entry.id}"/>
        <button class="toggle-vis card-pw-toggle">👁</button>
        </div>
      </div>
      <div>
        <p class="detail-label">CREATED</p>
        <p>${new Date(entry.createdAt).toLocaleDateString()}</p>
      </div>
    
  `;
  

  return card;
}, 

  // Opens the modal for adding or editing an entry
  openModal(entry) {
    entry.addEventListener('click',
      function () {
        if (addModal) {
          addModal.classList.remove('hidden');
    }
  }
);

  },

  // Closes the modal
  closeModal(closeBtn) {
    closeBtn.addEventListener('click', clearInput);
  },

  // Shows a short notification message at the bottom of the screen
  showToast(message, type) {
    // your code here
  },

  // Updates the strength bar based on the password typed
  updateStrengthBar(strengthBar, password) {
    if (!strengthBar) return;
    
    strengthBar.classList.remove('weak', 'medium', 'strong');
    
    let strength = 0;
    
    const passwordScore = Password.score(password);
    
    // Logic to calculate strength based on the 'password' parameter
    
    let width = "0%";

    if (password.length > 0) {
        if (passwordScore === 'weak') {
            strengthBar.classList.add('weak');
            width = "33%";
        } else if (passwordScore === 'medium') {
            strengthBar.classList.add('medium');
            width = "66%";
        } else if (passwordScore === 'strong') {
            strengthBar.classList.add('strong');
            width = "100%";
        }
    }

    strengthBar.style.width = width;
  },


  // Switches between Vault view and Generator view
  switchView(viewName) {
    const page = document.getElementById(viewName+'-'+'view');
    
    const allPages = document.querySelectorAll('.view');
    allPages.forEach(page => page.classList.add('hidden'));
    
    
    if(page){
      page.classList.remove('hidden');
    }
    
    
  },

  // Updates the total stored and weak count in the sidebar
  updateStats() {
    document.getElementById('total-count').textContent = vault.entries.length;
    document.getElementById('record-badge').textContent = vault.entries.length + ' records';
    document.getElementById('weak-count').textContent = vault.entries.filter(entry => entry.strength !== 'strong').length;
  },
}





