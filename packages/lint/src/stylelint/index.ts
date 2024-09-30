module.exports = {
    extends: require.resolve('./base.ts'),
    rules: {
        'function-no-unknown': [
            true,
            {
                ignoreFunctions: ['fade'],
            },
        ],
    },
};