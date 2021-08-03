const npminstall = require('npminstall');
const path = require('path')

npminstall({
    root: '/Users/liuyan/.i18n-fe-cli',
    registry: 'https://registry.npmjs.org',
    storeDir: path.resolve('/Users/liuyan/.i18n-fe-cli', 'node_modules'),
    pkgs: [
        { name: 'foo', version: '~1.0.0' },
    ],
});