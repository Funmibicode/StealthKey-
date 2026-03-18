// ============================================
// Password.js
// --------------------------------------------
// This file is a BLUEPRINT for a single password entry.
// Every time a user saves a password, a new Password
// object is created from this blueprint.
//
// It is responsible for:
// 1. Holding one entry's data (site, username, password, strength, id, createdAt)
// 2. Calculating the strength of a password automatically
// 3. Converting an entry to a plain object (toJSON) so it can be saved to localStorage
// 4. Rebuilding an entry from a plain object (fromJSON) after reading from localStorage
//
// It does NOT touch the DOM, inputs, or localStorage directly.
// ============================================

class Password {

  constructor(id, site, username, password, createdAt = null, strength = null) {
    
    this.id = id;
    this.site = site;
    this.username = username;
    this.password = password;
    this.strength = strength || Password.score(password);
    this.createdAt = createdAt || Date.now();
  }

  // Converts this Password instance to a plain object
  // Used by Vault._save() before storing to localStorage
  toJSON() {
    return {
      id: this.id,
      site: this.site,
      username: this.username,
      password: this.password,
      strength: this.strength,
      createdAt: this.createdAt
    };
  }


  // Rebuilds a Password instance from a plain object
  // Used by Vault.load() after reading from localStorage
  static fromJSON(obj) {
    const entry = new Password(
      obj.id,
      obj.site,
      obj.username,
      obj.password,
      obj.createdAt || obj.created_at,
      obj.strength
    );
    return entry;
  }

  // Checks how strong a password is
  // Returns "weak", "medium", or "strong"
  // Called automatically in the constructor
  static score(password) {
    let point = 0;
  

    if (password.length < 6) return 'weak';
    if (password.length >= 6 && password.length < 10) point++;
    if (password.length >= 10) point++;

  // check content
    if (/[A-Z]/.test(password)) point++;
    if (/[a-z]/.test(password)) point++;
    if (/[0-9]/.test(password)) point++;
    if (/[!@#$%^&*]/.test(password)) point++;

  // return result based on total points
    if (point <= 2) return 'weak';
    if (point <= 4) return 'medium';
    return 'strong';

  }

}

/*const passwordEntry = new Password (Date.now().toString(), "figma.com", "funmibi", "Fun#12");

console.log(passwordEntry);



const plainData = localStorage.setItem('data', JSON.stringify(passwordEntry)); 

 const getData = localStorage.getItem('data');
console.log(getData);

*/