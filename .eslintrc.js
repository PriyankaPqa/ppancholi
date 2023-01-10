module.exports = {
  env: {
    jest: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    project: 'tsconfig.eslint.json',
    extraFileExtensions: ['.vue'],
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended', // TODO See how to reactivate without causing issue
    '@vue/eslint-config-airbnb',
    'plugin:vuejs-accessibility/recommended',
    'airbnb-typescript/base',
    'plugin:cypress/recommended',
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    'no-param-reassign': ['error', { props: false }],
    complexity: ['error', { max: 16 }],
    'max-depth': ['error', 3],
    'max-params': ['error', 4],
    'max-nested-callbacks': ['error', 4],
    'max-statements': ['error', 31, { ignoreTopLevelFunctions: true }],
    'max-lines': ['error', { max: 1000, skipBlankLines: true, skipComments: true }],
    'max-len': 'off',
    'vue/max-len': ['error', {
      code: 180, tabWidth: 4, ignoreUrls: true, ignoreComments: true,
    }],
    'prefer-destructuring': ['error', { object: false, array: false }],
    'no-restricted-syntax': 'off',
    'max-lines-per-function': ['error', { max: 155, skipBlankLines: true, skipComments: true }],
    'vue/max-attributes-per-line': ['error', {
      singleline: 8,
      multiline: {
        max: 1,
      },
    }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'never',
    }],
    'linebreak-style': 0,
    'no-shadow': 'off',
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-useless-constructor': 'off',
    'class-methods-use-this': 'off',
    'vue/valid-v-slot': ['error', {
      allowModifiers: true,
    }],
    curly: ['error', 'all'],
    'no-underscore-dangle': 'off',
    'brace-style': [1, '1tbs', { allowSingleLine: false }],
    'vue/multi-word-component-names': 0,
    'vue/no-mutating-props': 0, // TODO Should eventually enable it and fix existing errors (false negative were there before the update)
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
        '*.spec.{j,t}s?(x)',
        '*.test.{j,t}s?(x)',
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
      files: ['**/*.spec.ts', '**/*.spec.js', '**/*.test.js'],
      rules: {
        '@typescript-eslint/no-shadow': 0,
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {
        '@typescript-eslint/indent': 'off', // So there is no conflict between indents of others
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-function': 2,
        '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
        '@typescript-eslint/no-shadow': 0,
        '@typescript-eslint/default-param-last': 0,
        '@typescript-eslint/naming-convention': 0,
      },
    },
  ],
  plugins: ['vuejs-accessibility'],
  ignorePatterns: ['dist/**', 'node_modules/**'],
};
