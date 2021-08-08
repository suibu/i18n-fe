'use strict';
const fs = require('fs')

const log = require('@i18n-fe/log')
const Command = require('@i18n-fe/command')

function init(argv) {
    const instance = new InitCommand(argv)
    return instance
}

class InitCommand extends Command {
    constructor(argv) {
        super(argv);
    }

    // 如果不实现initial，父类中会报错
    initial() {
        console.log('init command -init', this._options, this._cmd)
    }

    execute() {
        try {
            // 准备阶段
            this._prepare()
            // 下载模版
            this._downloadTemplate()
            // 安装模版
            this._installTemplate()
        } catch (e) {
            log.error(e.message)
        }
    }

    _prepare() {
        // 1、判断当前目录是否为空
        const isEmpty = this._isCwdEmpty()
        if (!isEmpty) {

        }

        // 2、是否启动强制更新
        // 3、选择创建项目/组件（后期项目平台/物料平台）
        // 4、获取项目的基本信息

    }

    _isCwdEmpty() {
        // Current file directory: 当前进程运行所在的文件夹，例如在：～/test运行，结果是：/xx/xx/test
        const curFileDir = process.cwd() || path.resolve('.')
        log.module(this.constructor.name, '当前的执行目录', curFileDir)
        //  读出所有的文件列表
        let fileList = fs.readdirSync(curFileDir);
        fileList = fileList.filter(filename => {
            const isExceptFile = !(['node_modules'].indexOf(filename) >= 0);
            const isNoOfUseFile = !filename.startsWith('.')
            return isExceptFile && isNoOfUseFile
        })
        log.module(this.constructor.name, fileList)
        return fileList.length === 0;
    }

    _downloadTemplate() {

    }

    _installTemplate() {

    }


}

module.exports = init;
