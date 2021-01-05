module.exports = {
  root: true,

  env: {
    node: true,
    jest: true,
  },

  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
    'eslint:recommended',
    'plugin:vuejs-accessibility/recommended',
  ],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': ['error', { props: false }],
    complexity: ['error', { max: 16 }],
    'max-depth': ['error', 3],
    'max-params': ['error', 4],
    'max-nested-callbacks': ['error', 4],
    'max-statements': ['error', 31, { ignoreTopLevelFunctions: true }],
    'max-lines': ['error', { max: 1000, skipBlankLines: true, skipComments: true }],
    'max-len': ['error', {
      code: 150, tabWidth: 4, ignoreUrls: true, ignoreComments: true,
    }],
    'max-lines-per-function': ['error', { max: 155, skipBlankLines: true, skipComments: true }],
    'vue/max-attributes-per-line': ['error', {
      singleline: 8,
      multiline: {
        max: 1,
        allowFirstLine: false,
      },
    }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'never',
    }],
    'linebreak-style': 0,
    'no-shadow': 'off',
    'no-unused-expressions': ['error', { allowTernary: true }],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },

  parserOptions: {
    parser: '@typescript-eslint/parser',
    extraFileExtensions: ['.vue'],
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
      rules: {
        'max-lines-per-function': 0,
        'max-nested-callbacks': 0,
        'max-lines': 0,
      },
    },
    {
      files: ['**/__mocks__/*.ts', '**/__mocks__/*.js'],
      rules: {
        'max-lines-per-function': 0,
        'max-nested-callbacks': 0,
        'max-lines': 0,
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
      extends: [
        '@vue/typescript/recommended',
      ],
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {
        '@typescript-eslint/indent': 'off', // So there is no conflict between indents of others
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
  settings: {

    'import/resolver': {

      node: {

        paths: ['src'],

      },

    },

  },
  plugins: ['vuejs-accessibility'],
};
