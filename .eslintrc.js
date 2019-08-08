module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'react'
  ],
  rules: {
    semi: ["error", "always"],
    indent: ["error", 4],
    quotes: ["error", "single"],
    "no-unused-vars": ["error", {
      "args": "after-used",
      "ignoreRestSiblings": false
    }]
  }
}