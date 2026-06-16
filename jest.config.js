/**
 * 🧪 Jest Configuration for DUYดูDEE
 */

export default {
    preset: null,
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    moduleFileExtensions: ["js", "json", "ts", "tsx"],
    testMatch: [
        "<rootDir>/public/src/**/__tests__/**/*.[jt]s",
        "<rootDir>/public/src/**/*.test.[jt]s",
        "<rootDir>/public/src/**/*.test.[jt]sx",
        "<rootDir>/public/src/**/*.spec.[jt]s",
        "<rootDir>/public/src/**/*.spec.[jt]sx",
    ],
    collectCoverageFrom: [
        "public/src/**/*.[jt]s",
        "public/src/**/*.[jt]sx",
        "!public/src/**/*.test.[jt]s",
        "!public/src/**/*.test.[jt]sx",
        "!public/src/**/*.spec.[jt]s",
        "!public/src/**/*.spec.[jt]sx",
        "!public/src/**/__tests__/**",
        "!public/src/services/firebase-config.js",
        "!public/src/services/firebase.js",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["html", "lcov", "text"],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/public/src/$1",
        "\\.(css|less|scss|sass)$": "<rootDir>/jest.mock.js",
        "^https://www\\.gstatic\\.com/firebasejs/(.*)$": "<rootDir>/jest.mock.js",
    },
    transform: {
        "^.+\\.js$": "babel-jest",
        "^.+\\.ts$": "ts-jest",
        "^.+\\.tsx$": "ts-jest",
    },
    transformIgnorePatterns: ["/node_modules/", "/dist/"],
    testPathIgnorePatterns: ["/node_modules/", "/dist/"],
    verbose: true,
    testTimeout: 10000,
};
