module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  moduleNameMapper: {
    '^/src/(.*)$': '<rootDir>/public/src/$1',
  },
};
