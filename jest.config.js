module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^/js/(.*)$': '<rootDir>/public/js/$1',
  },
};
