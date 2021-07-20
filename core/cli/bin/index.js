#!/usr/bin/env node
const pkg = require('../package.json')
const utils = require('@suibu-i18n-fe/utils')
utils()
console.log(pkg.version)