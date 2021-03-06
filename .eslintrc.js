module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ['@react-native-community', 'eslint:recommended', 'prettier'],
  rules: {
    'capitalized-comments': ['error', 'never'],
    'jsx-quotes': ['error', 'prefer-double'],
    'arrow-spacing': 'error',
    eqeqeq: ['error', 'always'],
    'no-const-assign': 'error',
    'no-shadow': 'error',
    'no-trailing-spaces': 'error',
    'no-unneeded-ternary': 'error',
    'no-var': 'error',
    'object-curly-spacing': ['error', 'always'],
    'sort-keys': ['error', 'asc', { natural: true }],
    'space-before-blocks': ['error', 'always'],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'no-console': 'warn',
    'prettier/prettier': 'error',
    'sort-imports-es6-autofix/sort-imports-es6': [
      2,
      {
        ignoreCase: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
      },
    ],
    'sort-keys-fix/sort-keys-fix': 'error'
  },
  plugins: ['sort-imports-es6-autofix', 'sort-keys-fix', 'prettier'],
};
