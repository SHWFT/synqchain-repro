#!/usr/bin/env node

/**
 * Security Configuration Check Script
 * Validates security settings and identifies potential vulnerabilities
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class SecurityChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  // Read environment file
  readEnvFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const env = {};
      
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          env[key] = valueParts.join('=');
        }
      });
      
      return env;
    } catch (error) {
      this.issues.push(`Cannot read environment file: ${filePath}`);
      return {};
    }
  }

  // Check JWT secret strength
  checkJwtSecret(env) {
    const jwtSecret = env.JWT_SECRET;
    
    if (!jwtSecret || jwtSecret === 'replace_me_with_strong_secret') {
      this.issues.push('JWT_SECRET is not set or using default value');
      return;
    }
    
    if (jwtSecret.length < 32) {
      this.warnings.push('JWT_SECRET should be at least 32 characters long');
    } else if (jwtSecret.length < 64) {
      this.warnings.push('JWT_SECRET could be longer for better security (recommended: 64+ chars)');
    } else {
      this.passed.push('JWT_SECRET has adequate length');
    }
    
    // Check for common weak patterns
    if (/^[a-z]+$/.test(jwtSecret) || /^[A-Z]+$/.test(jwtSecret) || /^\d+$/.test(jwtSecret)) {
      this.warnings.push('JWT_SECRET should contain mixed case letters, numbers, and symbols');
    } else {
      this.passed.push('JWT_SECRET appears to have good complexity');
    }
  }

  // Check database security
  checkDatabaseSecurity(env) {
    const dbUrl = env.DATABASE_URL;
    
    if (!dbUrl) {
      this.issues.push('DATABASE_URL is not configured');
      return;
    }
    
    // Check for weak database credentials
    if (dbUrl.includes('password') || dbUrl.includes('123456') || dbUrl.includes('admin:admin')) {
      this.issues.push('Database appears to use weak default credentials');
    }
    
    // Check for SSL requirement
    if (!dbUrl.includes('sslmode=require') && env.NODE_ENV === 'production') {
      this.warnings.push('Database connection should require SSL in production');
    } else if (dbUrl.includes('sslmode=require')) {
      this.passed.push('Database connection requires SSL');
    }
    
    // Check for localhost in production
    if (env.NODE_ENV === 'production' && dbUrl.includes('localhost')) {
      this.warnings.push('Database URL contains localhost in production environment');
    }
  }

  // Check CORS configuration
  checkCorsConfiguration(env) {
    const webOrigin = env.WEB_ORIGIN;
    
    if (!webOrigin) {
      this.warnings.push('WEB_ORIGIN is not configured - CORS will use defaults');
      return;
    }
    
    if (webOrigin === '*') {
      this.issues.push('WEB_ORIGIN is set to wildcard (*) - this is insecure');
      return;
    }
    
    if (webOrigin.includes('localhost') && env.NODE_ENV === 'production') {
      this.warnings.push('WEB_ORIGIN contains localhost in production');
    }
    
    if (webOrigin.startsWith('http://') && env.NODE_ENV === 'production') {
      this.warnings.push('WEB_ORIGIN uses HTTP in production - should use HTTPS');
    } else if (webOrigin.startsWith('https://')) {
      this.passed.push('WEB_ORIGIN uses HTTPS');
    }
  }

  // Check cookie security
  checkCookieSecurity(env) {
    if (env.NODE_ENV === 'production') {
      if (!env.COOKIE_DOMAIN) {
        this.warnings.push('COOKIE_DOMAIN should be set in production');
      } else {
        this.passed.push('COOKIE_DOMAIN is configured for production');
      }
    }
  }

  // Check file upload security
  checkFileUploadSecurity() {
    const uploadsDir = './data/files';
    
    if (fs.existsSync(uploadsDir)) {
      const stats = fs.statSync(uploadsDir);
      
      // Check directory permissions (Unix-like systems)
      if (process.platform !== 'win32') {
        const mode = stats.mode & parseInt('777', 8);
        if (mode & parseInt('002', 8)) {
          this.warnings.push('Upload directory is world-writable - consider restricting permissions');
        } else {
          this.passed.push('Upload directory has appropriate permissions');
        }
      }
    } else {
      this.warnings.push('Upload directory does not exist');
    }
  }

  // Check for common security files
  checkSecurityFiles() {
    const securityFiles = [
      { file: '.gitignore', description: 'Git ignore file' },
      { file: '.dockerignore', description: 'Docker ignore file' },
      { file: '.env.example', description: 'Environment template' },
    ];
    
    securityFiles.forEach(({ file, description }) => {
      if (fs.existsSync(file)) {
        this.passed.push(`${description} exists`);
      } else {
        this.warnings.push(`${description} is missing`);
      }
    });
    
    // Check if .env is in .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      if (gitignore.includes('.env')) {
        this.passed.push('.env files are properly ignored by Git');
      } else {
        this.issues.push('.env files are not ignored by Git - secrets may be committed');
      }
    }
  }

  // Check production readiness
  checkProductionReadiness(env) {
    if (env.NODE_ENV === 'production') {
      const productionChecks = [
        { key: 'JWT_SECRET', message: 'JWT secret' },
        { key: 'DATABASE_URL', message: 'Database URL' },
        { key: 'WEB_ORIGIN', message: 'Web origin' },
        { key: 'COOKIE_DOMAIN', message: 'Cookie domain' },
      ];
      
      productionChecks.forEach(({ key, message }) => {
        if (!env[key] || env[key].includes('localhost') || env[key].includes('replace_me')) {
          this.issues.push(`Production environment has insecure ${message}`);
        }
      });
    }
  }

  // Check package security
  checkPackageSecurity() {
    const packageJsonPath = './package.json';
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check for audit script
      if (packageJson.scripts && packageJson.scripts.audit) {
        this.passed.push('Package audit script is available');
      } else {
        this.warnings.push('Consider adding npm audit script to package.json');
      }
      
      // Check for security-related dependencies
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps['helmet']) {
        this.passed.push('Helmet security middleware is installed');
      } else {
        this.warnings.push('Consider adding Helmet for security headers');
      }
      
      if (deps['@nestjs/throttler']) {
        this.passed.push('Rate limiting middleware is installed');
      } else {
        this.warnings.push('Consider adding rate limiting middleware');
      }
    }
  }

  // Generate report
  generateReport() {
    console.log(chalk.cyan('\n🔒 SynqChain Security Configuration Check\n'));
    
    if (this.issues.length > 0) {
      console.log(chalk.red('🚨 Security Issues (Must Fix):'));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.issues.forEach(issue => {
        console.log(chalk.red(`❌ ${issue}`));
      });
      console.log('');
    }
    
    if (this.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  Security Warnings (Should Address):'));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.warnings.forEach(warning => {
        console.log(chalk.yellow(`⚠️  ${warning}`));
      });
      console.log('');
    }
    
    if (this.passed.length > 0) {
      console.log(chalk.green('✅ Security Checks Passed:'));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.passed.forEach(check => {
        console.log(chalk.green(`✅ ${check}`));
      });
      console.log('');
    }
    
    // Summary
    const total = this.issues.length + this.warnings.length + this.passed.length;
    console.log(chalk.cyan('📊 Security Summary:'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total checks: ${total}`);
    console.log(chalk.green(`Passed: ${this.passed.length}`));
    console.log(chalk.yellow(`Warnings: ${this.warnings.length}`));
    console.log(chalk.red(`Issues: ${this.issues.length}`));
    
    if (this.issues.length === 0) {
      console.log(chalk.green('\n🎉 No critical security issues found!'));
      if (this.warnings.length === 0) {
        console.log(chalk.green('🔒 Security configuration looks great!'));
      } else {
        console.log(chalk.yellow('⚠️  Please address the warnings above.'));
      }
    } else {
      console.log(chalk.red('\n🚨 Critical security issues found. Please fix before deployment.'));
    }
    
    console.log('');
    return this.issues.length === 0;
  }

  // Run all checks
  runChecks(envFile = '.env') {
    console.log(chalk.blue(`🔍 Checking security configuration in ${envFile}...`));
    
    const env = this.readEnvFile(envFile);
    
    this.checkJwtSecret(env);
    this.checkDatabaseSecurity(env);
    this.checkCorsConfiguration(env);
    this.checkCookieSecurity(env);
    this.checkFileUploadSecurity();
    this.checkSecurityFiles();
    this.checkProductionReadiness(env);
    this.checkPackageSecurity();
    
    return this.generateReport();
  }
}

// Main execution
function main() {
  const checker = new SecurityChecker();
  const envFile = process.argv[2] || '.env';
  
  const passed = checker.runChecks(envFile);
  process.exit(passed ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = SecurityChecker;
