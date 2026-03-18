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
    this.entries =  [];
  
  }

  /*// Creates a new Password entry and adds it to this.entries
  add(site, username, password) {
    
    const id = Date.now().toString();
    const newEntry = new Password(id, site, username, password);

    this.entries.unshift(newEntry);

    this._save(); 

    return newEntry;
  }*/
  
  async add(site, username, password) {
    const user = await supabaseClient.auth.getUser();
    const userId = user.data.user.id;

    const { data, error } = await     supabaseClient
      .from('Password')
      .insert({
        user_id: userId,
        site: site,
        username: username,
        password: password,
        strength: Password.score(password),
      })
    .select(); // returns the inserted row with its uuid

    if (error) {
      console.error('Supabase save error:', error.message);
      return;
    }

  // use the uuid Supabase generated
    const newEntry = Password.fromJSON(data[0]);
    this.entries.unshift(newEntry);
  
    localStorage.setItem('passCodes', JSON.stringify(this.entries.map(e => e.toJSON())));
  
    return newEntry;
  }
  
  

  /*// Finds an entry by id and updates its data
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
  }*/
  
  async update(id, site, username, password) {
  const passwordEntry = this.getById(id);

  if (passwordEntry) {
    passwordEntry.site = site;
    passwordEntry.username = username;
    passwordEntry.password = password;
    passwordEntry.strength = Password.score(password);

    // Update localStorage
    localStorage.setItem('passCodes', JSON.stringify(this.entries.map(e => e.toJSON())));

    // Update Supabase
    const { error } = await supabaseClient
      .from('Password')
      .update({
        site: site,
        username: username,
        password: password,
        strength: passwordEntry.strength,
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error.message);
    }
  }

  return passwordEntry;
}
  
  
  /*
  // Removes an entry from this.entries by id
  delete(id) {
    this.entries = this.entries.filter(entry => entry.id !== id);
    this._save(); 
  }
*/

async delete(id) {
  this.entries = this.entries.filter(entry => entry.id !== id);
  
  localStorage.setItem('passCodes', JSON.stringify(this.entries.map(e => e.toJSON())));

    const { error } = await             supabaseClient
      .from('Password')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error.message);
    }
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

  /*// Converts all entries to plain objects and saves to localStorage
  _save() {
    const stringifyEntry = JSON.stringify(this.entries.map(entry => entry.toJSON()));
    
    localStorage.setItem('passcodesDB',stringifyEntry);
    
  }*/
  async _save(entry) {
  // 1. Save to localStorage as before
    localStorage.setItem('passCodes', JSON.stringify(this.entries.map(e => e.toJSON())));

    // 2. Save to Supabase
    const user = await supabaseClient.auth.getUser();
    const userId = user.data.user.id;

    const { error } = await           supabaseClient
      .from('Password')
      .insert({
        user_id: userId,
        site: entry.site,
        username: entry.username,
        password: entry.password,
        strength: entry.strength,
    });

    if (error) {
      console.error('Supabase save error:', error.message);
    }
  }

 /* // Reads from localStorage and fills this.entries with Password instances
  load() {
    const getData = localStorage.getItem('passcodesDB');
    
    if (!getData) return []; // Return empty array if no data found

    try {
      const plainArray = JSON.parse(getData);

      return plainArray.map(obj => Password.fromJSON(obj));
    }catch (e) {
        return []; // Return empty array if JSON is corrupted
    }

  }*/
  async load() {
  // 1. Try Supabase first
  try {
    const user = await supabaseClient.auth.getUser();
    const userId = user.data.user.id;

    const { data, error } = await supabaseClient
      .from('Password')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
console.log(data);
    if (error) throw error;

    // 2. Save fetched data to localStorage as cache
    localStorage.setItem('passCodes', JSON.stringify(data));

    // 3. Convert to Password instances
    this.entries = data.map(obj => Password.fromJSON(obj));

  } catch(e) {
    // 4. Fall back to localStorage if Supabase fails
    console.warn('Supabase failed, loading from localStorage:', e.message);

    const stored = localStorage.getItem('passCodes');
    if (!stored) return;

    const parsed = JSON.parse(stored);
    this.entries = parsed.map(obj => Password.fromJSON(obj));
  }
}

}

  







