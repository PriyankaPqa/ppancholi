const path = require('path');
const baseConfig = require('../../.eslintrc');

module.exports = {
  ...baseConfig,
  root: true,
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
      typescript: {
        project: [
          path.resolve(__dirname, 'tsconfig.json'),
        ],
      },
    },
  },
};
