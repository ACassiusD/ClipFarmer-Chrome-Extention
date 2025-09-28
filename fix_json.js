const fs = require('fs');

// Read the file
const content = fs.readFileSync('instagram_reels_2025-09-28T21-17-43-371Z.json', 'utf8');

// Fix the double quotes issue in URLs
let jsonContent = content
  .replace(/""https"/g, '"https')  // Fix double quotes in URLs
  .replace(/""http"/g, '"http');   // Fix double quotes in URLs

// Write back to file
fs.writeFileSync('instagram_reels_2025-09-28T21-17-43-371Z.json', jsonContent);

console.log('Fixed double quotes in URLs');
