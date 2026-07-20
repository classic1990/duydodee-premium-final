#!/usr/bin/env node

/**
 * 🧹 DUYDODEE PREMIUM - PROJECT CLEANUP SCRIPT
 * Removes unnecessary files and directories to keep project clean
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function removeFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      log(`  ✓ Removed: ${description}`, 'green');
      return true;
    } catch (error) {
      log(`  ✗ Failed to remove: ${description}`, 'red');
      log(`    Error: ${error.message}`, 'red');
      return false;
    }
  } else {
    log(`  - Already removed: ${description}`, 'gray');
    return false;
  }
}

function removeDirectory(dirPath, description) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`  ✓ Removed: ${description}`, 'green');
      return true;
    } catch (error) {
      log(`  ✗ Failed to remove: ${description}`, 'red');
      log(`    Error: ${error.message}`, 'red');
      return false;
    }
  } else {
    log(`  - Already removed: ${description}`, 'gray');
    return false;
  }
}

function countFiles(dir) {
  let count = 0;
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.git') {
        count += countFiles(fullPath);
      }
    } else {
      count++;
    }
  }
  
  return count;
}

function removeLogFiles(dir) {
  let removedCount = 0;
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== '.git') {
          removedCount += removeLogFiles(fullPath);
        }
      } else if (item.endsWith('.log')) {
        try {
          fs.unlinkSync(fullPath);
          log(`  ✓ Removed: ${item}`, 'green');
          removedCount++;
        } catch (error) {
          // Ignore errors for log files
        }
      }
    }
  } catch (error) {
    // Ignore errors for directories we can't access
  }
  
  return removedCount;
}

function main() {
  log('============================================', 'cyan');
  log('   DUYDODEE PREMIUM - PROJECT CLEANUP', 'cyan');
  log('============================================', 'cyan');
  log('');
  
  const projectRoot = path.resolve(__dirname, '..');
  
  log('[1/5] Analyzing project structure...', 'yellow');
  log('');
  
  const beforeFiles = countFiles(projectRoot);
  log(`  Current file count: ${beforeFiles}`, 'cyan');
  log('');
  
  log('[2/5] Removing unused assets...', 'yellow');
  removeFile(
    path.join(projectRoot, 'public/assets/logo/ban.png'),
    'Unused image (ban.png)'
  );
  log('');
  
  log('[3/5] Removing optional documentation...', 'yellow');
  removeFile(
    path.join(projectRoot, 'CODE_OF_CONDUCT.md'),
    'Optional documentation (CODE_OF_CONDUCT.md)'
  );
  log('');
  
  log('[4/5] Removing temporary directories...', 'yellow');
  removeDirectory(path.join(projectRoot, 'backup'), 'Backup directory');
  removeDirectory(path.join(projectRoot, 'files'), 'Files directory');
  removeDirectory(path.join(projectRoot, 'dist'), 'Build output directory');
  removeDirectory(path.join(projectRoot, '.firebase'), 'Firebase cache directory');
  log('');
  
  log('[5/5] Removing log files...', 'yellow');
  const logFilesRemoved = removeLogFiles(projectRoot);
  if (logFilesRemoved === 0) {
    log('  - No log files found', 'gray');
  }
  log('');
  
  const afterFiles = countFiles(projectRoot);
  const removedFiles = beforeFiles - afterFiles;
  
  log('============================================', 'cyan');
  log('   PROJECT CLEANUP COMPLETED', 'green');
  log('============================================', 'cyan');
  log('');
  log('Summary:', 'cyan');
  log(`  Files before: ${beforeFiles}`, 'reset');
  log(`  Files after: ${afterFiles}`, 'reset');
  log(`  Files removed: ${removedFiles}`, 'green');
  log('');
  log('Removed items:', 'cyan');
  log('  ✓ Unused image files', 'green');
  log('  ✓ Optional documentation', 'green');
  log('  ✓ Temporary directories', 'green');
  log('  ✓ Log files', 'green');
  log('');
  log('Next steps:', 'yellow');
  log('  1. Run: npm run dev', 'reset');
  log('  2. Verify the application works correctly', 'reset');
  log('  3. Run: npm run lint', 'reset');
  log('  4. Run: npm run test', 'reset');
  log('');
}

main();