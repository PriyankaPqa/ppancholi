const path = require('path');
const baseConfig = require('../../.eslintrc');

module.exports = {
  ...baseConfig,
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    project: 'tsconfig.eslint.json',
    extraFileExtensions: ['.vue'],
    tsconfigRootDir: __dirname,
  },

  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
      typescript: {
        project: [
          path.resolve(__dirname, 'tsconfig.eslint.json'),
        ],
      },
    },
  },
};
