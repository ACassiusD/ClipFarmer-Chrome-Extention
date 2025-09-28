const fs = require('fs');

// Read the file
const content = fs.readFileSync('instagram_reels_2025-09-28T21-17-43-371Z.json', 'utf8');

// Convert JavaScript object syntax to JSON
let jsonContent = content
  .replace(/(\w+):/g, '"$1":')  // Add quotes around property names
  .replace(/'/g, '"')           // Replace single quotes with double quotes
  .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

// Write back to file
fs.writeFileSync('instagram_reels_2025-09-28T21-17-43-371Z.json', jsonContent);

console.log('File converted to proper JSON format');