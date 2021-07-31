'use strict';

module.exports = core;

// 依赖的外部库
const semver = require('semver')
const colors = require('colors/safe')
const commander = require('commander');
const { program, Command } = commander
// 依赖的内部库
const exec = require('@i18n-fe/exec')
// const utils = require('@i18n-fe/utils')
const log = require('@i18n-fe/log')
// command 区域
const init = require('@i18n-fe/init')


// 变量区域
const pkg = require('../package.json');
const constant = require('./const')

// utils
const preCheck = require('./prepare/check')

async function core() {
    try {
        await prepare(pkg)
        checkNodeVersion()

        registryCommand()
    } catch(e) {
        log.error(e.message)
    }
}

async function prepare(pkg) {
    // preCheck.config
    preCheck.pkgVersion(pkg)
    preCheck.userAuth()
    preCheck.userHome()
    preCheck.cliEnv()
    await preCheck.globalUpdate(pkg)
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


function registryCommand() {
    const cliName = Object.keys(pkg.bin)[0]
    // 基础配置
    program
        .name(cliName)
        .version(pkg.version)
        .usage('<command> [options]')
        // 注册到全局的 [options]
        .option('-d, --debug', '启动debug模式', false)
        .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');


    // 监听[options]:debug -> 开启debug模式
    program.on('option:debug',  function (debug) {
        if (debug) {
            process.env.LOG_LEVEL = 'verbose'
            process.env.DEBUG = '1'
        } else {
            process.env.LOG_LEVEL = 'info'
            process.env.DEBUG = '0'
        }
        log.level = process.env.LOG_LEVEL
    })
    // 监听[options]:targetPath ->
    program.on('option:targetPath',  function (targetPath) {
        console.log(targetPath)
        process.env.CLI_TARGET_PATH = targetPath
    })
    program
        .command('init [projectName]')
        .option('-f, --force', '是否强制初始化', false)
        .action(init)

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
