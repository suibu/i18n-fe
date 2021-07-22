#!/usr/bin/env node

const importLocal = require('import-local')
console.log(__filename, importLocal(__filename))

if (importLocal(__filename)) {
    require('npmlog').info('cli ', '正在使用本地i18n-fe ')
} else {
    require('../lib')(process.argv.slice(2))
}