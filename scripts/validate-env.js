#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are set before deployment
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const REQUIRED_VARS = [
    'VITE_ADMIN_EMAIL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
];

// Optional but recommended variables
const RECOMMENDED_VARS = [
    'VITE_FIREBASE_MEASUREMENT_ID'
];

/**
 * Loads environment variables from .env file
 * @param {string} envPath - Path to .env file
 * @returns {Object} Environment variables object
 */
function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) {
        console.warn('⚠️  .env file not found');
        return {};
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            if (key) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });

    return envVars;
}

/**
 * Validates environment variables
 * @param {Object} envVars - Environment variables object
 * @returns {Object} Validation result with isValid and errors
 */
function validateEnvVars(envVars) {
    const errors = [];
    const warnings = [];

    // Check required variables
    REQUIRED_VARS.forEach(varName => {
        if (!envVars[varName]) {
            errors.push(`Missing required variable: ${varName}`);
        } else if (envVars[varName] === 'PLACEHOLDER_CHANGE_ME' || envVars[varName] === 'your_api_key_here') {
            errors.push(`${varName} is set to placeholder value - please update with actual value`);
        }
    });

    // Check recommended variables
    RECOMMENDED_VARS.forEach(varName => {
        if (!envVars[varName]) {
            warnings.push(`Missing recommended variable: ${varName}`);
        }
    });

    // Validate Firebase configuration format
    if (envVars.VITE_FIREBASE_API_KEY) {
        if (envVars.VITE_FIREBASE_API_KEY.length < 20) {
            errors.push('VITE_FIREBASE_API_KEY appears to be too short');
        }
    }

    if (envVars.VITE_FIREBASE_PROJECT_ID) {
        if (!/^[a-z0-9-]+$/.test(envVars.VITE_FIREBASE_PROJECT_ID)) {
            errors.push('VITE_FIREBASE_PROJECT_ID must contain only lowercase letters, numbers, and hyphens');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Main validation function
 */
function main() {
    console.log('🔍 Validating Environment Variables...\n');

    const envPath = path.join(__dirname, '..', '.env');
    const envVars = loadEnvFile(envPath);
    const validation = validateEnvVars(envVars);

    // Display results
    if (validation.errors.length > 0) {
        console.error('❌ Validation Failed:');
        validation.errors.forEach(error => console.error(`   - ${error}`));
        console.error('\nPlease fix these errors before deploying.');
        process.exit(1);
    }

    if (validation.warnings.length > 0) {
        console.warn('⚠️  Warnings:');
        validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
    }

    console.log('✅ All required environment variables are valid!');
    console.log(`   Found ${Object.keys(envVars).length} environment variables`);
    
    if (validation.warnings.length === 0) {
        console.log('   No warnings detected.');
    }

    process.exit(0);
}

// Run validation
main();
