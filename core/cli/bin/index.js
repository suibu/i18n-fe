#!/usr/bin/env node

const importLocal = require('import-local')
const log = require('@i18n-fe/log')
if (importLocal(__filename)) {
    log.info('i18n-fe ', '正在使用本地i18n-fe脚手架')
} else {
    require('../lib')(process.argv.slice(2))
}