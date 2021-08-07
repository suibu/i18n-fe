'use strict';

const semver = require('semver');
const colors = require('colors')
const log = require('@i18n-fe/log')

const {isObject} = require("@i18n-fe/utils");

const LOWEST_NODE_VERSION = '10.0.0';

class Command {
    _argv;
    _cmd;
    _options;
    constructor(argv) {
        if (!argv) throw new Error('参数不能为空')
        if (!Array.isArray(argv)) throw new Error('参数必须是数组')
        if (argv.length < 1) throw new Error('数组长度为空')

        this._argv = argv
        let runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve()
            chain = chain.then(() => this.checkNodeVersion())
            chain = chain.then(() => this.initArgs())
            chain = chain.then(() => this.initial())
            chain = chain.then(() => this.execute())
            // 每新建promise 都要使用try catch
            chain.catch(e => {
                log.error(e.message)
            })
        })
    }

    checkNodeVersion() {
        // 1、当前node version
        const curVersion = process.version;
        // 2、比对 当前版本与最低版本
        const lowestVersion = LOWEST_NODE_VERSION
        if (!semver.gte(curVersion, lowestVersion)) {
            throw new Error(colors.red(`need more than node ${LOWEST_NODE_VERSION}`))
        }
    }

    initArgs() {
        const [commandName, options] = this._argv
        this._cmd = commandName
        this._options = options
    }

    initial() {
        throw new Error('子类必须实现 initial 方法')
    }

    execute() {
        throw new Error('子类必须实现 execute 方法')
    }
}
module.exports = Command;
