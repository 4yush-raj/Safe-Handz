const fs = require('fs');
const logPath = 'C:\\Users\\Ayush Raj\\.gemini\\antigravity\\brain\\076b646a-437b-4c88-a130-45910639103a\\.system_generated\\logs\\overview.txt';

if (!fs.existsSync(logPath)) {
  console.log("Log file not found");
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

let pos = 0;
while (true) {
  pos = content.indexOf('AdminDashboard.jsx', pos);
  if (pos === -1) break;
  
  let start = content.lastIndexOf('{"step_index"', pos);
  if (start === -1) start = Math.max(0, pos - 1000);
  
  let end = content.indexOf('\n', pos);
  if (end === -1) end = content.length;
  
  const stepText = content.substring(start, end);
  
  // Parse step index
  const stepMatch = stepText.match(/"step_index":\s*(\d+)/);
  const stepIndex = stepMatch ? parseInt(stepMatch[1], 10) : null;
  
  if (stepText.includes('replace_file_content') || stepText.includes('write_to_file') || stepText.includes('multi_replace_file_content')) {
    console.log(`\n=== Modifying Step ${stepIndex} at pos ${pos} ===`);
    // Print the replacement content or target content if we can find it
    console.log(stepText.substring(0, 1500) + '...');
  }
  
  pos += 1;
}
