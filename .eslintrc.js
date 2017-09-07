module.exports = {
    parser: 'babel-eslint',

    env: {
        es6: true,
        node: true,
        browser: false,
    },

    extends: ['eslint:recommended'],

    overrides: [
        {
            files: ['src/**/*.js'],
            env: {
                browser: true,
                node: false,
            },
        },
    ],

    rules: {
        'no-shadow': ['error', {
            builtinGlobals: false,
            hoist: 'functions',
            allow: [],
        }],
        'no-use-before-define': ['error', {
            'functions': false,
            'classes': false,
        }],
        semi: ['error', 'never'],
        'array-bracket-spacing': ['error', 'never'],
        'brace-style': 'error',
        'comma-dangle': ['error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'always-multiline',
        }],
        'comma-spacing': 'error',
        'comma-style': ['error', 'last'],
        'max-len': ['warn', {
            code: 80,
            tabWidth: 2,
            ignoreComments: true,
            ignoreTrailingComments: true,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
        }],
        'generator-star-spacing': ['error', {
            before: true,
            after: true,
        }],
        indent: ['error', 4],
        'no-restricted-globals': [
            'error',
            'find',
            'self',
            'event',
        ],
        'object-curly-spacing': ['error', 'always'],
    },
}
