'use strict';

module.exports = core;
const pkg = require('../package.json');

const utils = require('@i18n-fe/utils')
const log = require('@i18n-fe/log')

function core() {
    checkPkgVersion()
}

function checkPkgVersion() {
    log.success('version', pkg.version)
}
