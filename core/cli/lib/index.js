'use strict';

module.exports = core;

// node内置库
const path = require('path')

// 依赖的外部库
const semver = require('semver')
const colors = require('colors/safe')
const pathExists = require('path-exists').sync;
const userHome = require('user-home')
// 依赖的内部库
const utils = require('@i18n-fe/utils')
const log = require('@i18n-fe/log')

// 变量区域
const pkg = require('../package.json');
const constant = require('./const')

let args = {}, config;

function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        checkEnv()
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

// 检查用户主目录 userHome
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
        process.env.DEBUG = true
    } else {
        process.env.LOG_LEVEL = 'info'
        process.env.DEBUG = false

    }
    log.level = process.env.LOG_LEVEL
}

function checkEnv() {
    console.log(process.cwd())
    const dotenv = require('dotenv');
    // Default: path.resolve(process.cwd(), '.env') 默认是当前文件夹下的 .env文件
    // 主目录环境
    const envPath = path.resolve(userHome, '.env')
    if (pathExists(envPath)) {
        config = dotenv.config({ path: envPath })
    } else {
        config = createDefaultConfig()
     }
}

// 创建默认用户主目录 .env
function createDefaultConfig() {
    // 若配置过cli文件，就去读。反之使用默认的
    const _cliHome = process.env.CLI_HOME_FILENAME
    const config = {
        home: userHome,
        cliHomePath: _cliHome ? path.join(userHome, _cliHome) : path.join(userHome, constant.DEFAULT_CLI_HOME_FILENAME)
    }
    process.env.CLI_HOME_PATH = config.cliHomePath
    return config
}