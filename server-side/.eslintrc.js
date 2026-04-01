module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-param-reassign': ['error', { props: false }],
    'consistent-return': 'warn',
    'func-names': 'off',
    'object-shorthand': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-const': 'warn',
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
