module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/public/src/**/*.test.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  collectCoverageFrom: [
    'public/src/**/*.js',
    '!public/src/**/*.test.js',
  ],
};
