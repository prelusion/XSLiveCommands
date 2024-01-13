/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    // 'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    '@electron-toolkit/eslint-config-ts/eslint-recommended',
    // '@vue/eslint-config-typescript/recommended',
    // '@vue/eslint-config-prettier'
  ],
  rules: {
    'vue/require-default-prop': 'off',

    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // Doesn't allow for custom event rule names like: 'button-clicked' or 'enlarge-text' (from vue website)
    'vue/valid-v-on': 'off',

    // https://eslint.vuejs.org/rules/multi-word-component-names.html
    'vue/multi-word-component-names': 'off',
  }
}