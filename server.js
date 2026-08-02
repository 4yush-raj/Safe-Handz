const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Safe Handz project (Backend and Frontend)...');

// Function to run a child process and prefix its output
function startProcess(name, command, args, cwd) {
  // On Windows, commands like 'npm' must run through a shell
  const isWin = process.platform === 'win32';
  const proc = spawn(command, args, {
    cwd: path.resolve(__dirname, cwd),
    shell: isWin,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line) console.log(`[${name}] ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line) console.error(`[${name} ERROR] ${line}`);
    });
  });

  proc.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });

  return proc;
}

// Start backend server
const backend = startProcess('Backend', 'npm', ['start'], './backend');

// Start frontend server
const frontend = startProcess('Frontend', 'npm', ['run', 'dev'], './frontend');

// Handle exit signals to terminate child processes
const handleShutdown = () => {
  console.log('\nShutting down servers...');
  try {
    backend.kill();
  } catch (e) {}
  try {
    frontend.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
