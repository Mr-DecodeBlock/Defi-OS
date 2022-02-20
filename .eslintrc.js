module.exports = {
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'jest'],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'linebreak-style': 'off',
    'prettier/prettier': [
      'warn', // i changed to warn , because of the error: insert traling new line on line 1:37 Approval/index.tsx "prettier/prettier 
      {
        endOfLine: 'auto',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'react/self-closing-comp': 0,
    'react/require-default-props': 0,
    'import/prefer-default-export': 0,
    'no-debugger': 0,
  },
}
