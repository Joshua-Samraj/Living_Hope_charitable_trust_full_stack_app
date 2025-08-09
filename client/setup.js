const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to execute commands and log output
function runCommand(command, cwd = process.cwd()) {
  console.log(`${colors.bright}${colors.cyan}Running: ${command}${colors.reset}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.bright}${colors.yellow}Failed to execute: ${command}${colors.reset}`);
    return false;
  }
}

// Main setup function
async function setup() {
  console.log(`\n${colors.bright}${colors.magenta}=== Setting up Living Hope Trust Website ===${colors.reset}\n`);
  
  // Step 1: Install frontend dependencies
  console.log(`\n${colors.bright}${colors.blue}Step 1: Installing frontend dependencies...${colors.reset}`);
  if (!runCommand('npm install')) {
    console.error(`${colors.bright}${colors.yellow}Failed to install frontend dependencies. Exiting.${colors.reset}`);
    return;
  }
  
  // Step 2: Install backend dependencies
  console.log(`\n${colors.bright}${colors.blue}Step 2: Installing backend dependencies...${colors.reset}`);
  if (!runCommand('npm install', path.join(process.cwd(), 'backend'))) {
    console.error(`${colors.bright}${colors.yellow}Failed to install backend dependencies. Exiting.${colors.reset}`);
    return;
  }
  
  // Step 3: Seed the database
  console.log(`\n${colors.bright}${colors.blue}Step 3: Seeding the database...${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}Note: Make sure MongoDB is running on your system.${colors.reset}`);
  if (!runCommand('npm run seed', path.join(process.cwd(), 'backend'))) {
    console.error(`${colors.bright}${colors.yellow}Failed to seed the database. Please make sure MongoDB is running.${colors.reset}`);
    // Continue anyway as this might be a MongoDB connection issue
  }
  
  // Step 4: Provide instructions for running the application
  console.log(`\n${colors.bright}${colors.green}=== Setup Complete ===${colors.reset}`);
  console.log(`\n${colors.bright}${colors.blue}To run the application:${colors.reset}`);
  console.log(`\n1. Start the backend server:`);
  console.log(`   ${colors.cyan}cd backend && npm run dev${colors.reset}`);
  console.log(`\n2. In a new terminal, start the frontend:`);
  console.log(`   ${colors.cyan}npm run dev${colors.reset}`);
  console.log(`\n${colors.bright}${colors.green}The frontend will be available at: http://localhost:5173${colors.reset}`);
  console.log(`${colors.bright}${colors.green}The backend API will be available at: http://localhost:5000${colors.reset}\n`);
}

// Run the setup
setup().catch(error => {
  console.error(`${colors.bright}${colors.yellow}Setup failed with error: ${error}${colors.reset}`);
});