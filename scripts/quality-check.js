#!/usr/bin/env node

/**
 * Quality Gates Check Script
 * Runs all quality checks and reports status
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

const checks = [
  {
    name: 'TypeScript Compilation',
    command: 'npm run typecheck',
    description: 'Checking TypeScript compilation...'
  },
  {
    name: 'ESLint',
    command: 'npm run lint',
    description: 'Running ESLint checks...'
  },
  {
    name: 'Unit Tests',
    command: 'npm run test:unit',
    description: 'Running unit tests...'
  },
  {
    name: 'E2E API Tests',
    command: 'npm run test:e2e:api',
    description: 'Running API end-to-end tests...'
  }
];

async function runCheck(check) {
  console.log(chalk.blue(`🔍 ${check.description}`));
  
  try {
    execSync(check.command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(chalk.green(`✅ ${check.name} passed\n`));
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ ${check.name} failed\n`));
    return false;
  }
}

async function main() {
  console.log(chalk.cyan('🚀 Running SynqChain Quality Gates\n'));
  
  const results = [];
  
  for (const check of checks) {
    const passed = await runCheck(check);
    results.push({ ...check, passed });
  }
  
  console.log(chalk.cyan('📊 Quality Gates Summary:'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  let allPassed = true;
  
  results.forEach(result => {
    const status = result.passed ? chalk.green('PASS') : chalk.red('FAIL');
    console.log(`${status} ${result.name}`);
    if (!result.passed) allPassed = false;
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (allPassed) {
    console.log(chalk.green('\n🎉 All quality gates passed! Ready for deployment.\n'));
    process.exit(0);
  } else {
    console.log(chalk.red('\n💥 Some quality gates failed. Please fix the issues before proceeding.\n'));
    process.exit(1);
  }
}

// Check if chalk is available, if not provide fallback
try {
  require.resolve('chalk');
} catch (e) {
  console.log('Installing chalk for better output...');
  execSync('npm install chalk', { stdio: 'inherit' });
}

main().catch(error => {
  console.error('Quality check script failed:', error);
  process.exit(1);
});
