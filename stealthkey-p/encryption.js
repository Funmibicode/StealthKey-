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

  // Derives a crypto key from the master password
  async deriveKey(masterPassword, salt) {
    // your code here - Step 7
  },

  // Encrypts a plain text password string
  async encrypt(plaintext, key) {
    // your code here - Step 7
  },

  // Decrypts an encrypted password string
  async decrypt(ciphertext, key) {
    // your code here - Step 7
  },

}
