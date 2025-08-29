#!/usr/bin/env node

/**
 * Development Environment Setup Checker
 * Validates that all required tools and dependencies are properly installed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chalk = require('chalk');

const requiredTools = [
  {
    name: 'Node.js',
    command: 'node --version',
    versionRegex: /v(\d+)/,
    minVersion: 20,
    installUrl: 'https://nodejs.org/'
  },
  {
    name: 'npm',
    command: 'npm --version',
    versionRegex: /(\d+)/,
    minVersion: 10,
    installUrl: 'https://nodejs.org/'
  },
  {
    name: 'Docker',
    command: 'docker --version',
    versionRegex: /(\d+)/,
    minVersion: 20,
    installUrl: 'https://docs.docker.com/get-docker/'
  },
  {
    name: 'Docker Compose',
    command: 'docker compose version',
    versionRegex: /v(\d+)/,
    minVersion: 2,
    installUrl: 'https://docs.docker.com/compose/install/'
  }
];

const requiredFiles = [
  '.env',
  'apps/api/prisma/schema.prisma',
  'docker/docker-compose.yml'
];

const requiredDirectories = [
  'apps/api',
  'apps/web',
  'data/files'
];

function checkCommand(tool) {
  try {
    const output = execSync(tool.command, { encoding: 'utf8', stdio: 'pipe' });
    const match = output.match(tool.versionRegex);
    
    if (match) {
      const version = parseInt(match[1], 10);
      const isValid = version >= tool.minVersion;
      
      return {
        found: true,
        version: match[0],
        valid: isValid,
        message: isValid 
          ? `${tool.name} ${match[0]} ✅`
          : `${tool.name} ${match[0]} (requires v${tool.minVersion}+) ❌`
      };
    }
    
    return {
      found: true,
      valid: false,
      message: `${tool.name} found but version unclear ⚠️`
    };
  } catch (error) {
    return {
      found: false,
      valid: false,
      message: `${tool.name} not found ❌`
    };
  }
}

function checkFile(filePath) {
  const exists = fs.existsSync(filePath);
  return {
    exists,
    message: exists ? `${filePath} ✅` : `${filePath} missing ❌`
  };
}

function checkDirectory(dirPath) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  return {
    exists,
    message: exists ? `${dirPath}/ ✅` : `${dirPath}/ missing ❌`
  };
}

function main() {
  console.log(chalk.cyan('🔧 SynqChain Development Environment Check\n'));
  
  let allValid = true;
  
  // Check required tools
  console.log(chalk.blue('📋 Required Tools:'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  requiredTools.forEach(tool => {
    const result = checkCommand(tool);
    console.log(result.message);
    
    if (!result.valid) {
      allValid = false;
      console.log(chalk.gray(`   Install from: ${tool.installUrl}`));
    }
  });
  
  // Check required files
  console.log('\n' + chalk.blue('📄 Required Files:'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  requiredFiles.forEach(filePath => {
    const result = checkFile(filePath);
    console.log(result.message);
    
    if (!result.exists) {
      allValid = false;
      if (filePath === '.env') {
        console.log(chalk.gray('   Copy from .ENV-EXAMPLE and configure'));
      }
    }
  });
  
  // Check required directories
  console.log('\n' + chalk.blue('📁 Required Directories:'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  requiredDirectories.forEach(dirPath => {
    const result = checkDirectory(dirPath);
    console.log(result.message);
    
    if (!result.exists) {
      allValid = false;
      if (dirPath === 'data/files') {
        console.log(chalk.gray('   Create with: mkdir -p data/files'));
      }
    }
  });
  
  // Check Docker service
  console.log('\n' + chalk.blue('🐳 Docker Service:'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    execSync('docker info', { stdio: 'pipe' });
    console.log('Docker daemon running ✅');
  } catch (error) {
    console.log('Docker daemon not running ❌');
    console.log(chalk.gray('   Start Docker Desktop or Docker service'));
    allValid = false;
  }
  
  // Final result
  console.log('\n' + chalk.cyan('📊 Setup Status:'));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (allValid) {
    console.log(chalk.green('🎉 Development environment is ready!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('1. npm install'));
    console.log(chalk.gray('2. docker compose up -d'));
    console.log(chalk.gray('3. npm run seed'));
    console.log(chalk.gray('4. npm run dev'));
  } else {
    console.log(chalk.red('💥 Please fix the issues above before proceeding.'));
    process.exit(1);
  }
}

main();
