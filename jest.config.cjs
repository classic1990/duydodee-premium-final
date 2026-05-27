module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^https://www\.gstatic\.com/firebasejs/.*$': '<rootDir>/tests/__mocks__/firebase-mock.js',
    '^/js/(.*)$': '<rootDir>/public/js/$1',
  },
};
