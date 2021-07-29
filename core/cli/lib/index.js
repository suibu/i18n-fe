'use strict';

module.exports = core;

// node内置库
const path = require('path')

// 依赖的外部库
const semver = require('semver')
const colors = require('colors/safe')
const pathExists = require('path-exists').sync;
const userHome = require('user-home')
const commander = require('commander');
const { program, Command } = commander
// 依赖的内部库
const utils = require('@i18n-fe/utils')
const log = require('@i18n-fe/log')

// 变量区域
const pkg = require('../package.json');
const constant = require('./const')

let args = {}, config;

async function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        // checkInputArgs()
        checkEnv()
        await checkGlobalUpdate()
        injectCommand()
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
        process.env.DEBUG = '1'
    } else {
        process.env.LOG_LEVEL = 'info'
        process.env.DEBUG = '0'

    }
    log.level = process.env.LOG_LEVEL
}

function checkEnv() {
    // process.cwd() 获得当前路径
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

// 功能：告诉用户可以升级版本
async function checkGlobalUpdate() {
    // 获取当前版本号和包名
    const { name, version } = pkg;
    // 调取 npm API，获取所有版本号
    const { isLatestVersion, getNpmLatestVersion } = require("@i18n-fe/get-npm-info")
    // 提取所有版本号，比对那些版本号是大于当前版本号
    const isLatest = await isLatestVersion(name,version)
    if(!isLatest) {
        const latestVersion = await getNpmLatestVersion(name,version)
        log.warn(colors.yellow(`
        建议安装最新版本
        npm install ${name}@^${latestVersion} -g
        yarn global add ${name}@^${latestVersion}`))
    }
}

function injectCommand() {
    const cliName = Object.keys(pkg.bin)[0]
    // 基础配置
    program
        .name(cliName)
        .version(pkg.version)
        .usage('<command> [options]')
        .option('-d, --debug', '启动debug模式', false);

    // 开启debug模式
    program.on('option:debug',  function () {
        if (this.opts().debug) {
            process.env.LOG_LEVEL = 'verbose'
            process.env.DEBUG = '1'
        } else {
            process.env.LOG_LEVEL = 'info'
            process.env.DEBUG = '0'
        }
        log.level = process.env.LOG_LEVEL
    })


    // 对未知的命令进行监听
    program.on('command:*', function (operands) {
        console.log(colors.red(`unknown command '${operands[0]}'`))
        const availableCommands = program.commands.map(cmd => cmd.name());
        if (availableCommands.length === 0) {
            console.log(colors.red(`available commands: '${availableCommands}'`))
        }
        process.exitCode = 1;
    });

    program.parse(process.argv);

    // 若 <command> 都没有输入，给用户一个帮助文档
    if(program.args && program.args.length < 1) {
        program.outputHelp()
    }
}
