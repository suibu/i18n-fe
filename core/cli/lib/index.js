'use strict';

module.exports = core;
const semver = require('semver')
const colors = require('colors/safe')
const pathExists = require('path-exists').sync;
const userHome = require('user-home')
const utils = require('@i18n-fe/utils')
const log = require('@i18n-fe/log')

const pkg = require('../package.json');
const constant = require('./const')

let args = {};

function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        log.verbose('debug', 'test')

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

// 检查root启动
function checkRoot() {
    // 当前用户OS
    const curUserAuthCode = process.geteuid();
    const rootCheck = require('root-check');
    // 实现原理是：root用户,process.getuid() === 0。普通用户，为501。若检测到是root用户，就降级操作process.seteuid()
    // 为什么要做这步操作：当root用户操作的一些文件后，普通用户在进来操作会有权限问题
    rootCheck()
}

// 检查用户主目录
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red(`主目录不存在`))
    }
}

// 检查入参
function checkInputArgs() {
    const minimist = require('minimist')
    args = minimist(process.argv.slice(2))
    checkArgs('debug');
}

function checkArgs(key) {
    if (args[key]) {
        process.env.LOG_LEVEL = 'verbose'
    } else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}