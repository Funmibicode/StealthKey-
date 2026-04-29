// ============================================
// Password.js — Blueprint for a single password entry
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

  // Converts this Password instance to a plain object for storage
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
  static fromJSON(obj) {
    return new Password(
      obj.id,
      obj.site,
      obj.username,
      obj.password,
      obj.createdAt || obj.created_at,
      obj.strength
    );
  }

  // Returns 'weak', 'medium', or 'strong'
  static score(password) {
    let point = 0;

    if (password.length < 6) return 'weak';
    if (password.length >= 6 && password.length < 10) point++;
    if (password.length >= 10) point++;

    if (/[A-Z]/.test(password)) point++;
    if (/[a-z]/.test(password)) point++;
    if (/[0-9]/.test(password)) point++;
    if (/[!@#$%^&*]/.test(password)) point++;

    if (point <= 2) return 'weak';
    if (point <= 4) return 'medium';
    return 'strong';
  }

}
