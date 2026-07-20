#!/usr/bin/env node

/**
 * 🔍 DUYDODEE PREMIUM - Health Check Script
 * Performs comprehensive health checks on the project
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCriticalFiles() {
  log('\n📁 Checking Critical Files...', 'cyan');
  
  const criticalFiles = [
    'package.json',
    'vite.config.js',
    'firebase.json',
    'firestore.rules',
    '.env.example',
    'public/src/services/firebase-config.js',
    'public/src/services/auth-service.js',
    'public/src/utils/error-handler.js',
    'public/src/config/security-config.js'
  ];

  let allExist = true;
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    if (exists) {
      log(`  ✓ ${file}`, 'green');
    } else {
      log(`  ✗ ${file} - MISSING`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

function checkEnvironmentSetup() {
  log('\n🔧 Checking Environment Setup...', 'cyan');
  
  const envExample = fs.existsSync(path.join(__dirname, '..', '.env.example'));
  const envLocal = fs.existsSync(path.join(__dirname, '..', '.env.local'));
  
  if (envExample) {
    log('  ✓ .env.example exists', 'green');
  } else {
    log('  ✗ .env.example missing', 'red');
  }

  if (envLocal) {
    log('  ⚠ .env.local exists (should not be committed)', 'yellow');
  } else {
    log('  ✓ .env.local not found (good for security)', 'green');
  }

  return envExample;
}

function checkDependencies() {
  log('\n📦 Checking Dependencies...', 'cyan');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('  ✗ package.json not found', 'red');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '..', 'node_modules'));
  
  if (nodeModulesExists) {
    log('  ✓ node_modules installed', 'green');
  } else {
    log('  ⚠ node_modules not found - run npm install', 'yellow');
  }

  return true;
}

function checkSecurityConfiguration() {
  log('\n🔒 Checking Security Configuration...', 'cyan');
  
  const securityConfigPath = path.join(__dirname, '..', 'public/src/config/security-config.js');
  const firestoreRulesPath = path.join(__dirname, '..', 'firestore.rules');
  
  let securityScore = 0;
  
  if (fs.existsSync(securityConfigPath)) {
    log('  ✓ Security config file exists', 'green');
    securityScore++;
  } else {
    log('  ✗ Security config missing', 'red');
  }

  if (fs.existsSync(firestoreRulesPath)) {
    log('  ✓ Firestore rules exist', 'green');
    securityScore++;
  } else {
    log('  ✗ Firestore rules missing', 'red');
  }

  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignore.includes('.env.local') && gitignore.includes('serviceAccountKey.json')) {
      log('  ✓ .gitignore protects sensitive files', 'green');
      securityScore++;
    } else {
      log('  ⚠ .gitignore may not protect all sensitive files', 'yellow');
    }
  }

  return securityScore >= 2;
}

function checkBuildConfiguration() {
  log('\n🏗️  Checking Build Configuration...', 'cyan');
  
  const viteConfigPath = path.join(__dirname, '..', 'vite.config.js');
  const postcssConfigPath = path.join(__dirname, '..', 'postcss.config.cjs');
  
  let buildScore = 0;
  
  if (fs.existsSync(viteConfigPath)) {
    log('  ✓ Vite config exists', 'green');
    buildScore++;
  } else {
    log('  ✗ Vite config missing', 'red');
  }

  if (fs.existsSync(postcssConfigPath)) {
    log('  ✓ PostCSS config exists', 'green');
    buildScore++;
  } else {
    log('  ⚠ PostCSS config missing', 'yellow');
  }

  return buildScore >= 1;
}

function checkTestingSetup() {
  log('\n🧪 Checking Testing Setup...', 'cyan');
  
  const jestConfigPath = path.join(__dirname, '..', 'jest.config.js');
  const testFiles = fs.readdirSync(path.join(__dirname, '..', 'public/src'))
    .filter(file => file.endsWith('.test.js') || file.endsWith('.spec.js'));
  
  let testingScore = 0;
  
  if (fs.existsSync(jestConfigPath)) {
    log('  ✓ Jest config exists', 'green');
    testingScore++;
  } else {
    log('  ✗ Jest config missing', 'red');
  }

  if (testFiles.length > 0) {
    log(`  ✓ Found ${testFiles.length} test file(s)`, 'green');
    testingScore++;
  } else {
    log('  ⚠ No test files found', 'yellow');
  }

  return testingScore >= 1;
}

function generateHealthReport(checks) {
  log('\n📊 Health Report Summary', 'cyan');
  log('═'.repeat(50), 'cyan');
  
  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const healthPercentage = Math.round((passedChecks / totalChecks) * 100);
  
  log(`\nOverall Health: ${healthPercentage}%`, healthPercentage >= 80 ? 'green' : healthPercentage >= 60 ? 'yellow' : 'red');
  log(`Passed: ${passedChecks}/${totalChecks} checks`, 'reset');
  
  if (healthPercentage >= 80) {
    log('\n✅ Project is in good health!', 'green');
  } else if (healthPercentage >= 60) {
    log('\n⚠️  Project needs some attention.', 'yellow');
  } else {
    log('\n❌ Project requires immediate attention.', 'red');
  }
  
  log('\nRecommendations:', 'cyan');
  if (!checks.criticalFiles) log('  - Ensure all critical files are present', 'yellow');
  if (!checks.environmentSetup) log('  - Set up environment variables properly', 'yellow');
  if (!checks.securityConfiguration) log('  - Review and improve security configuration', 'yellow');
  if (!checks.buildConfiguration) log('  - Verify build configuration', 'yellow');
  if (!checks.testingSetup) log('  - Add more tests to improve coverage', 'yellow');
  
  log('\n═'.repeat(50), 'cyan');
}

function main() {
  log('🏥 DUYDODEE PREMIUM - Health Check', 'cyan');
  log('═'.repeat(50), 'cyan');
  
  const checks = {
    criticalFiles: checkCriticalFiles(),
    environmentSetup: checkEnvironmentSetup(),
    dependencies: checkDependencies(),
    securityConfiguration: checkSecurityConfiguration(),
    buildConfiguration: checkBuildConfiguration(),
    testingSetup: checkTestingSetup()
  };
  
  generateHealthReport(checks);
  
  const overallHealth = Object.values(checks).filter(Boolean).length >= 4;
  process.exit(overallHealth ? 0 : 1);
}

main();