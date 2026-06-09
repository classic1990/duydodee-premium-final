/**
 * 🧪 Jest Configuration for DUYดูDEE
 */

export default {
    preset: null,
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: ['js', 'json'],
    testMatch: [
        '<rootDir>/public/src/**/__tests__/**/*.js',
        '<rootDir>/public/src/**/*.test.js',
        '<rootDir>/public/src/**/*.spec.js'
    ],
    collectCoverageFrom: [
        'public/src/**/*.js',
        '!public/src/**/*.test.js',
        '!public/src/**/*.spec.js',
        '!public/src/**/__tests__/**',
        '!public/src/services/firebase-config.js',
        '!public/src/services/firebase.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'lcov', 'text'],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/public/src/$1',
        '\\.(css|less|scss|sass)$': '<rootDir>/jest.mock.js'
    },
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    transformIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/public/src/config/config.test.js'
    ],
    verbose: true,
    testTimeout: 10000
};
