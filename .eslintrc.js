module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    rules: {
        'brace-style': ['error', '1tbs'],
        'comma-spacing': ['error'],
        'curly': [
            'error',
            'all',
        ],
        'eol-last': ['error', 'always'],
        'function-paren-newline': ['error', 'multiline-arguments'],
        'indent': ['error', 4, { SwitchCase: 1 }],
        'key-spacing': ['error'],
        'keyword-spacing': ['error'],
        'lines-between-class-members': ['error', 'always'],
        'max-len': ['error', 132],
        'max-statements-per-line': ['error', { max: 1 }],
        'no-alert': ['error'],
        'no-debugger': 'warn',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-inner-declarations': 'error',
        'no-multi-spaces': ['error'],
        'no-multiple-empty-lines': ['error', {
            max: 1,
            maxEOF: 0,
            maxBOF: 0,
        }],
        'no-var': ['error'],
        'operator-linebreak': ['error', 'after'],
        'padded-blocks': ['error', 'never', {
            allowSingleLineBlocks: false,
        }],
        'prefer-arrow-callback': 'error',
        'quote-props': [
            'error',
            'consistent-as-needed',
        ],
        'quotes': [
            'error',
            'single',
            {
                avoidEscape: true,
            },
        ],
        'semi-spacing': ['error'],
        'semi-style': ['error', 'last'],
        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always',
        }],
        'space-infix-ops': ['error'],
        'space-unary-ops': ['error'],
        'spaced-comment': ['error', 'always', {
            block: {
                balanced: true,
            },
        }],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/member-delimiter-style': ['error', {
            multiline: {
                delimiter: 'semi',
                requireLast: true,
            },
            singleline: {
                delimiter: 'semi',
                requireLast: false,
            },
        }],
        '@typescript-eslint/no-explicit-any': ['error'],
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/explicit-member-accessibility': ['error'],

        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': ['error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'always-multiline',
            enums: 'always-multiline',
            generics: 'always-multiline',
            tuples: 'always-multiline',
        }],

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn'],

        'semi': 'off',
        '@typescript-eslint/semi': ['error'],
    },
};
