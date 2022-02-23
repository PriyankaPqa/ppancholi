const base = require('../../.eslintrc');

module.exports = {
  ...base,
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
};
