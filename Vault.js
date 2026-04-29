// ============================================
// Vault.js — manages ALL saved password entries
// ============================================

class Vault {

  constructor() {
    this.entries = [];
  }

  // Creates a new Password entry and saves to Supabase + localStorage
  async add(site, username, password, strength) {
    const user = await supabaseClient.auth.getUser();
    const userId = user.data.user.id;

    const { data, error } = await supabaseClient
      .from('Password')
      .insert({
        user_id: userId,
        site: site,
        username: username,
        password: password,
        strength: strength,
      })
      .select();

    if (error) {
      console.error('Supabase save error:', error.message);
      return;
    }

    const newEntry = Password.fromJSON(data[0]);
    this.entries.unshift(newEntry);
    localStorage.setItem('passCodes', JSON.stringify(this.entries.map(e => e.toJSON())));

    return newEntry;
  }

  // Finds an entry by id and updates it in Supabase + localStorage
  async update(id, site, username, password, strength) {
    const passwordEntry = this.getById(id);

    if (passwordEntry) {
      passwordEntry.site = site;
      passwordEntry.username = username;
      passwordEntry.password = password;
      passwordEntry.strength = strength;

      localStorage.setItem('passCodes', JSON.stringify(this.entries.map(e => e.toJSON())));

      const { error } = await supabaseClient
        .from('Password')
        .update({
          site: site,
          username: username,
          password: password,
          strength: strength,
        })
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error.message);
      }
    }

    return passwordEntry;
  }

  // Removes an entry from Supabase + localStorage
  async delete(id) {
    this.entries = this.entries.filter(entry => entry.id !== id);
    localStorage.setItem('passCodes', JSON.stringify(this.entries.map(e => e.toJSON())));

    const { error } = await supabaseClient
      .from('Password')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error.message);
    }
  }

  // Returns a single entry by id
  getById(id) {
    return this.entries.find(entry => entry.id === id);
  }

  // Returns entries matching the search query
  search(query) {
    const term = query.toLowerCase();
    return this.entries.filter(entry =>
      entry.site.toLowerCase().includes(term) ||
      entry.username.toLowerCase().includes(term)
    );
  }

  // Loads entries from Supabase, falls back to localStorage
  async load() {
    try {
      const user = await supabaseClient.auth.getUser();
      const userId = user.data.user.id;

      const { data, error } = await supabaseClient
        .from('Password')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      localStorage.setItem('passCodes', JSON.stringify(data));
      this.entries = data.map(obj => Password.fromJSON(obj));

    } catch(e) {
      console.warn('Supabase failed, loading from localStorage:', e.message);

      const stored = localStorage.getItem('passCodes');
      if (!stored) return;

      const parsed = JSON.parse(stored);
      this.entries = parsed.map(obj => Password.fromJSON(obj));
    }
  }

}
