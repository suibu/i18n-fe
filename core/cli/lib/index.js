'use strict';

module.exports = core;
const semver = require('semver')
const colors = require('colors/safe')
const pkg = require('../package.json');

const utils = require('@i18n-fe/utils')
const log = require('@i18n-fe/log')

const constant = require('./const')

function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
    } catch(e) {
        log.error(e.message)
    }
}
function checkNodeVersion() {
// 1、当前node version
    const curVersion = process.version;
// 2、比对 当前版本与最低版本
    const lowestVersion = constant.LOWEST_NODE_VERSION
    if (!semver.gte(curVersion, lowestVersion)) {
        throw new Error(colors.red(`need more than node v14 +`))
    }
}

function checkPkgVersion() {
    log.success('version', pkg.version)
}

