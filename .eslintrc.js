module.exports = {
    parser: 'babel-eslint',

    env: {
        es6: true,
        node: true,
        browser: false,
    },

    plugins: ['prettier'],

    extends: ['eslint:recommended', 'prettier'],

    overrides: [
        {
            files: ['src/**/*.js'],
            env: {
                jest: false,
                browser: true,
                node: false,
            },
        },
        {
            files: ['**/*.test.js'],
            env: {
                jest: true,
                node: true,
                browser: false,
            },
        },
    ],

    rules: {
        'no-shadow': [
            'error',
            {
                builtinGlobals: false,
                hoist: 'functions',
                allow: [],
            },
        ],
        'no-use-before-define': [
            'error',
            {
                functions: false,
                classes: false,
            },
        ],
        'no-restricted-globals': ['error', 'find', 'self', 'event'],
        'prettier/prettier': 'warn',
    },
}
