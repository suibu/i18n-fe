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
        checkRoot()
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

function checkRoot() {
    // 当前用户OS
    const curUserAuthCode = process.geteuid();
    const rootCheck = require('root-check');
    // 实现原理是：root用户,process.getuid() === 0。普通用户，为501。若检测到是root用户，就降级操作process.seteuid()
    // 为什么要做这步操作：当root用户操作的一些文件后，普通用户在进来操作会有权限问题
    rootCheck()
    console.log(process.geteuid())
}