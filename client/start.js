import { spawn } from 'child_process';
import path from 'path';
import colors from 'colors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize colors
colors.setTheme({
  info: 'green',
  warn: 'yellow',
  error: 'red',
  frontend: 'cyan',
  backend: 'magenta'
});

// Function to run a command in a specific directory
function runCommand(command, args, cwd, name) {
  console.log(`[${name}] `.bold[`${name.toLowerCase()}`] + `Starting ${command} ${args.join(' ')}...`);
  
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'pipe'
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`[${name}] `.bold[`${name.toLowerCase()}`] + line.toString());
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`[${name}] `.bold[`${name.toLowerCase()}`] + line.toString().error);
      }
    });
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.log(`[${name}] `.bold[`${name.toLowerCase()}`] + `Process exited with code ${code}`.error);
    } else {
      console.log(`[${name}] `.bold[`${name.toLowerCase()}`] + `Process exited successfully`.info);
    }
  });

  return child;
}

// Start backend server
const backendPath = path.join(__dirname, 'backend');
const backendProcess = runCommand('npm', ['run', 'dev'], backendPath, 'BACKEND');

// Start frontend development server
const frontendProcess = runCommand('npm', ['run', 'dev'], __dirname, 'FRONTEND');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down all processes...'.warn);
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});