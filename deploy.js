#!/usr/bin/env node
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(colors[color] + msg + colors.reset);
}

function exec(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: opts.silent ? 'pipe' : 'inherit', encoding: 'utf8', ...opts });
  } catch (error) {
    if (!opts.ignoreError) {
      log('❌ Failed: ' + cmd, 'red');
      throw error;
    }
    return null;
  }
}

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'cyan');
  try {
    log('✅ Node: ' + exec('node --version', { silent: true }).trim(), 'green');
    log('✅ npm: ' + exec('npm --version', { silent: true }).trim(), 'green');
    try {
      log('✅ Firebase: ' + exec('firebase --version', { silent: true }).trim(), 'green');
    } catch {
      log('⚠️  Firebase CLI not found', 'yellow');
    }
  } catch {
    log('❌ Prerequisites missing', 'red');
    process.exit(1);
  }
}

function showMenu() {
  console.clear();
  log('╔══��═════════════════════════════════════════╗', 'cyan');
  log('║   🚀 DUYDODEE Deployment System v2.0      ║', 'bright');
  log('╚════════════════════════════════════════════╝', 'cyan');
  log('\n📋 Options:\n', 'yellow');
  log('  [1] 🔥 Full Deploy (Test+Build+Deploy)', 'green');
  log('  [2] ⚡ Quick Deploy (Build+Deploy)', 'cyan');
  log('  [3] 🛡️  Rules Only', 'yellow');
  log('  [4] 🧪 Test & Lint', 'cyan');
  log('  [5] 📦 Build Only', 'cyan');
  log('  [0] 🚪 Exit\n');
}

async function main() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const ask = (q) => new Promise(r => readline.question(q, a => { readline.close(); r(a.trim()); }));
  
  try {
    showMenu();
    const choice = await ask('Select (0-5): ');
    
    switch (choice) {
      case '1':
        log('\n🔥 Full Deploy...', 'bright');
        checkPrerequisites();
        log('\n🧪 Testing...', 'cyan');
        exec('npm test');
        log('\n🔍 Linting...', 'cyan');
        exec('npm run lint');
        log('\n🎨 Building CSS...', 'cyan');
        exec('npm run build:css');
        log('\n📦 Building...', 'cyan');
        exec('npm run build:prod');
        log('\n🚀 Deploying...', 'cyan');
        exec('firebase deploy');
        log('\n🎉 Done! https://duydodeesport.web.app', 'green');
        break;
        
      case '2':
        log('\n⚡ Quick Deploy...', 'bright');
        checkPrerequisites();
        exec('npm run build:css');
        exec('npm run build:prod');
        exec('firebase deploy --only hosting');
        log('\n✅ Done!', 'green');
        break;
        
      case '3':
        log('\n🛡️  Deploying Rules...', 'bright');
        checkPrerequisites();
        exec('firebase deploy --only firestore:rules');
        log('\n✅ Done!', 'green');
        break;
        
      case '4':
        log('\n🧪 Testing...', 'bright');
        checkPrerequisites();
        exec('npm test');
        exec('npm run lint');
        log('\n✅ All passed!', 'green');
        break;
        
      case '5':
        log('\n📦 Building...', 'bright');
        checkPrerequisites();
        exec('npm run build:css');
        exec('npm run build:prod');
        log('\n✅ Done!', 'green');
        break;
        
      case '0':
        log('\n👋 Bye!', 'cyan');
        break;
        
      default:
        log('\n❌ Invalid', 'red');
        process.exit(1);
    }
  } catch (error) {
    log('\n❌ Failed: ' + error.message, 'red');
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { checkPrerequisites, exec };
