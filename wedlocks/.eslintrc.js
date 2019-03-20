module.exports = {
  extends: ['standard', 'airbnb', 'eslint:recommended'],
  env: {
    es6: true,
    node: true,
    browser: true,
    jest: true
  },
  plugins: ['jest', 'promise', 'import'],
  parser: 'babel-eslint',
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      // use <root>/tsconfig.json
      typescript: {}
    }
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false }
    ],
    'brace-style': 0,
    'react/forbid-prop-types': 2,
    indent: 0, // this conflicts with prettier and is not needed
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'standard/computed-property-even-spacing': 0,
    'standard/object-curly-even-spacing': 0,
    'standard/array-bracket-even-spacing': 0,
    'promise/prefer-await-to-then': 'warn',
    'eol-last': ['error']
  }
}