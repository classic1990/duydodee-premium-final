/**
 * 🔧 Babel Configuration for Jest
 * Transforms ES modules for testing
 */

export default {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                }
            }
        ]
    ]
};