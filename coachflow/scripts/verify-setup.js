#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks that all required files and dependencies are in place
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function check(name, condition) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    return true;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

console.log(`${colors.blue}CoachFlow Setup Verification${colors.reset}\n`);

let allGood = true;

// Check config files
console.log('Configuration Files:');
allGood &= check('package.json', fileExists('package.json'));
allGood &= check('tsconfig.json', fileExists('tsconfig.json'));
allGood &= check('next.config.ts', fileExists('next.config.ts'));
allGood &= check('tailwind.config.ts', fileExists('tailwind.config.ts'));
console.log();

// Check environment
console.log('Environment:');
allGood &= check('.env.local.example', fileExists('.env.local.example'));
const envExists = fileExists('.env.local');
allGood &= check('.env.local', envExists);
if (!envExists) {
  console.log(`${colors.yellow}  → Run: cp .env.local.example .env.local${colors.reset}`);
}
console.log();

// Check database
console.log('Database:');
allGood &= check('Database setup script', fileExists('scripts/setup-db.js'));
const dbExists = fileExists('coachflow.db');
check('coachflow.db', dbExists);
if (!dbExists) {
  console.log(`${colors.yellow}  → Run: npm run db:setup${colors.reset}`);
}
console.log();

// Check source files
console.log('Source Files:');
allGood &= check('src/lib/db.ts', fileExists('src/lib/db.ts'));
allGood &= check('src/lib/agent.ts', fileExists('src/lib/agent.ts'));
allGood &= check('src/lib/types.ts', fileExists('src/lib/types.ts'));
allGood &= check('src/app/page.tsx', fileExists('src/app/page.tsx'));
allGood &= check('src/app/dashboard/page.tsx', fileExists('src/app/dashboard/page.tsx'));
console.log();

// Check API routes
console.log('API Routes:');
allGood &= check('POST /api/coach/create', fileExists('src/app/api/coach/create/route.ts'));
allGood &= check('GET /api/coach/[id]', fileExists('src/app/api/coach/[id]/route.ts'));
allGood &= check('GET /api/actions/today', fileExists('src/app/api/actions/today/route.ts'));
allGood &= check('POST /api/agent/generate', fileExists('src/app/api/agent/generate/route.ts'));
console.log();

// Check node_modules
console.log('Dependencies:');
const hasNodeModules = fileExists('node_modules');
check('node_modules/', hasNodeModules);
if (!hasNodeModules) {
  console.log(`${colors.yellow}  → Run: npm install${colors.reset}`);
}
console.log();

// Check for API key in .env.local
if (envExists) {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const hasApiKey = envContent.includes('ANTHROPIC_API_KEY') &&
                    !envContent.includes('your_claude_api_key_here');

  console.log('API Configuration:');
  check('Claude API key set', hasApiKey);
  if (!hasApiKey) {
    console.log(`${colors.yellow}  → Edit .env.local and add your Claude API key${colors.reset}`);
    console.log(`${colors.yellow}  → Get key from: https://console.anthropic.com/settings/keys${colors.reset}`);
  }
  console.log();
}

// Final summary
console.log('─'.repeat(50));
if (allGood && hasNodeModules && dbExists && envExists) {
  console.log(`${colors.green}✓ All checks passed! Ready to run.${colors.reset}`);
  console.log(`\nStart the dev server with: ${colors.blue}npm run dev${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠ Some setup steps are needed.${colors.reset}`);
  console.log('\nFollow the instructions above, then run:');
  console.log(`  ${colors.blue}node scripts/verify-setup.js${colors.reset}`);
}
console.log();
