const ionic = require('@ionic/eslint-config/recommended');

module.exports = [
  { ignores: ['build/**', 'dist/**'] },
  ...ionic,
  {
    files: ['src/stripe.enum.ts'],
    // Public reader aliases intentionally share values for backward compatibility.
    rules: { '@typescript-eslint/no-duplicate-enum-values': 'off' },
  },
];
