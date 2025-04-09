export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(pear-apps-utils-validator|pear-apps-utils-pattern-search)/)'
  ],
  setupFilesAfterEnv: ['./jest.setup.js']
}
