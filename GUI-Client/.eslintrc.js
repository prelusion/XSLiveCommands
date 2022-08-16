module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true
    },
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

        // Doesn't allow for custom event rule names like: 'button-clicked' or 'enlarge-text' (from vue website)
        'vue/valid-v-on': 'off',

        // https://eslint.vuejs.org/rules/multi-word-component-names.html
        'vue/multi-word-component-names': 'off',
    }
}
