// ============================================
// Vault.js
// --------------------------------------------
// This file manages ALL saved password entries.
// Think of it as the database of your app.
//
// It is responsible for:
// 1. Holding all entries in an array (this.entries)
// 2. Adding a new password entry
// 3. Updating an existing entry
// 4. Deleting an entry
// 5. Finding a single entry by its id
// 6. Searching entries by site or username
// 7. Saving all entries to localStorage (_save)
// 8. Loading all entries from localStorage (load)
//
// It does NOT touch the DOM or input fields.
// It talks to Password.js to create and restore entries.
// ============================================

class Vault {

  constructor() {
    this.entries = this.load() || [];
  
  }

  // Creates a new Password entry and adds it to this.entries
  add(site, username, password) {
    
    const id = Date.now().toString();
    const newEntry = new Password(id, site, username, password);

    this.entries.unshift(newEntry);

    this._save(); 

    return newEntry;
  }

  // Finds an entry by id and updates its data
  update(id, site, username, password) {
    const passwordEntry = this.getById(id);
    if (passwordEntry) {
      passwordEntry.site = site;
      passwordEntry.username = username;
      passwordEntry.password = password;
      passwordEntry.strength = Password.score(password);
        
      this._save(); 
    }
    
    return passwordEntry;
  }
  
  // Removes an entry from this.entries by id
  delete(id) {
    this.entries = this.entries.filter(entry => entry.id !== id);
    this._save(); 
  }

  // Returns a single entry that matches the given id
  getById(id) {
    return this.entries.find(entry => entry.id === id);
  }

  // Returns entries where site or username matches the search query
  search(query) {
  const term = query.toLowerCase();
  return this.entries.filter(entry => {
    return entry.site.toLowerCase().includes(term) || 
           entry.username.toLowerCase().includes(term);
  });
}

  // Converts all entries to plain objects and saves to localStorage
  _save() {
    const stringifyEntry = JSON.stringify(this.entries.map(entry => entry.toJSON()));
    
    localStorage.setItem('passcodesDB',stringifyEntry);
    
  }

  // Reads from localStorage and fills this.entries with Password instances
  load() {
    const getData = localStorage.getItem('passcodesDB');
    
    if (!getData) return []; // Return empty array if no data found

    try {
      const plainArray = JSON.parse(getData);

      return plainArray.map(obj => Password.fromJSON(obj));
    }catch (e) {
        return []; // Return empty array if JSON is corrupted
    }

  }

}

  







