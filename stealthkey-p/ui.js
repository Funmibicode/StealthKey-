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
  renderList(vault, query, filter) {
    // your code here
  },

  // Builds and returns a single password card HTML element
  buildCard(entry) {
    // your code here
  },

  // Opens the modal for adding or editing an entry
  openModal(entry) {
    // your code here
  },

  // Closes the modal
  closeModal() {
    // your code here
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
  updateStats(vault) {
    // your code here
  },

}
