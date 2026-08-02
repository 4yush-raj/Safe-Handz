const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\Ayush Raj\\.gemini\\antigravity\\brain\\076b646a-437b-4c88-a130-45910639103a\\.system_generated\\logs\\overview.txt';

if (!fs.existsSync(logPath)) {
  console.log("Log file not found at " + logPath);
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

// Find all occurrences of write_to_file or replace_file_content for AdminDashboard.jsx
const regex = /"TargetFile":\s*"[^"]*AdminDashboard.jsx"[^]*?"CodeContent":\s*"([^"]+)"/g;
let match;
let found = false;

// Let's search for "AdminDashboard.jsx" and grab chunks of 1000 characters around it to locate the write/replace calls.
let index = 0;
while ((index = content.indexOf('AdminDashboard.jsx', index)) !== -1) {
  console.log(`\n--- Match at index ${index} ---`);
  const start = Math.max(0, index - 500);
  const end = Math.min(content.length, index + 3500);
  console.log(content.substring(start, end));
  index += 'AdminDashboard.jsx'.length;
  found = true;
}

if (!found) {
  console.log("No mentions found.");
}
