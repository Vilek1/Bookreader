const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'coverage/*', 'samples/*'],
  },
  prettierConfig,
];
