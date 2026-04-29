// ============================================
// ui.js — handles everything the user sees on screen
// ============================================

const UI = {

  // Loops through vault entries and renders password cards
  renderList(searchTerm = '', filterStrength = 'all') {
    const list = document.getElementById('password-list');
    const emptyState = document.getElementById('empty-state');

    list.querySelectorAll('.pw-card').forEach(card => card.remove());

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

  // Builds and returns a single password card element
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
      </div>
    `;

    return card;
  },

  // Updates the strength bar based on password typed
  updateStrengthBar(strengthBar, password) {
    if (!strengthBar) return;

    strengthBar.classList.remove('weak', 'medium', 'strong');

    if (!password) {
      strengthBar.style.width = '0%';
      return;
    }

    const score = Password.score(password);
    const widths = { weak: '33%', medium: '66%', strong: '100%' };

    strengthBar.classList.add(score);
    strengthBar.style.width = widths[score];
  },

  // Switches between Vault and Generator views
  switchView(viewName) {
    document.querySelectorAll('.view').forEach(page => page.classList.add('hidden'));
    const target = document.getElementById(viewName + '-view');
    if (target) target.classList.remove('hidden');
  },

  // Updates the stats in the sidebar
  updateStats() {
    document.getElementById('total-count').textContent = vault.entries.length;
    document.getElementById('record-badge').textContent = vault.entries.length + ' records';
    document.getElementById('weak-count').textContent = vault.entries.filter(e => e.strength !== 'strong').length;
  },

}
