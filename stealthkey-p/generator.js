// ============================================
// generator.js
// --------------------------------------------
// This file generates a random strong password string.
// It knows nothing about saving, displaying or classes.
// It just takes some options and returns a password string.
//
// It is responsible for:
// 1. Building a character set based on user options
//    (uppercase, lowercase, numbers, symbols)
// 2. Using crypto.getRandomValues() to pick random characters
//    (more secure than Math.random())
// 3. Returning the generated password string
//
// It does NOT touch the DOM, localStorage, or any class.
// app.js calls it when the user clicks the GENERATE button.
// ============================================







const Generator = {
  generate(options) {
    const { length, uppercase, lowercase, numbers, symbols } = options;
    
    // 1. Build the character pool based on user choices
    let availableChars = "";
    if (uppercase) availableChars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) availableChars += "abcdefghijklmnopqrstuvwxyz";
    if (numbers)   availableChars += "0123456789";
    if (symbols)   availableChars += "!@#$%^&*";
    
    

    // 2. Safety Check: If user unchecks everything, return empty
    if (availableChars.length === 0) return "";

    let generatedPassword = "";

    // 3. Loop through the requested length
    for (let i = 0; i < length; i++) {
      // Create a 32-bit unsigned integer array to store a random number
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      
      // Get a random index within the range of our availableChars
      // (Using modulo % ensures the number fits our pool size)
      const randomIndex = randomValues[0] % availableChars.length;
      
      generatedPassword += availableChars[randomIndex];
    }

    return generatedPassword;
  }
};


