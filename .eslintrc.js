// .eslintrc.js
// ---------------------------------------------------------
// ESLint para manter o código limpo e consistente.
// - @react-native/eslint-config: regras recomendadas para RN.
// - @typescript-eslint: suporte a TypeScript.
// - react-hooks: garante regras dos hooks (useEffect, etc).
// - prettier: evita conflito de regras de formatação.
// ---------------------------------------------------------

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
    // Se você usar "project", precisa de tsconfig com "project": ["./tsconfig.json"].
    // Manter sem "project" deixa o lint mais rápido e simples para começar.
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    '@react-native/eslint-config',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier' // sempre por último para desativar conflitos de formatação
  ],
  settings: {
    react: { version: 'detect' }
  },
  rules: {
    // Regras úteis para RN + TS
    'react/react-in-jsx-scope': 'off', // RN não precisa de import React no topo
    '@typescript-eslint/explicit-module-boundary-types': 'off', // flexibilidade em funções
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  ignorePatterns: [
    'babel.config.js',
    'metro.config.js'
  ],
};
