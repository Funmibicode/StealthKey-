// ============================================
// encryption.js
// --------------------------------------------
// This file handles encrypting and decrypting passwords
// using the Web Crypto API (built into the browser).
// This is Step 7 - leave it empty until you get there.
//
// It will be responsible for:
// 1. Deriving a secret key from the master password
// 2. Encrypting a password string before saving
// 3. Decrypting a password string after loading
//
// It does NOT touch the DOM or localStorage directly.
// ============================================

const Encryption = {

  async deriveKey(masterPassword, salt) {
    
    // Step 1 — convert master password string into raw key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(masterPassword),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Step 2 — use PBKDF2 to derive the actual key
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },



  // Encrypts a plain text password string
  async encrypt(text, key) {

  // Step 1 — create a random IV (initialization vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

  // Step 2 — convert text to bytes
    const encodedText = new TextEncoder().encode(text);

  // Step 3 — encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedText
    );

  // Step 4 — convert to base64 string for localStorage
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
    const ivBase64 = btoa(String.fromCharCode(...iv));

  // Step 5 — return both iv and encrypted data together
    return ivBase64 + ':' + encryptedBase64;
  },

  // Decrypts an encrypted password string
  async decrypt(encryptedText, key) {

  // Step 1 — split the iv and encrypted data
  const [ivBase64, encryptedBase64] = encryptedText.split(':');

  // Step 2 — convert base64 back to bytes
  const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
  const encryptedArray = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));

  // Step 3 — decrypt
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encryptedArray
  );

  // Step 4 — convert bytes back to string
  return new TextDecoder().decode(decryptedBuffer);
  },
  
  getOrCreateSalt() {
  const existing = localStorage.getItem('sk_salt');
  if (existing) {
    return new Uint8Array(atob(existing).split('').map(c => c.charCodeAt(0)));
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  localStorage.setItem('sk_salt', btoa(String.fromCharCode(...salt)));
  return salt;
},

}
