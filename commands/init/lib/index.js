'use strict';
const path = require('path');
const fsExtra = require('fs-extra')

const inquirer = require('inquirer')

const log = require('@i18n-fe/log')
const Command = require('@i18n-fe/command')

const typeChoices = [
    { name: 'project', type: 'PROJECT' },
    { name: 'component', type: 'COMPONENT' }
]

function init(argv) {
    const instance = new InitCommand(argv)
    return instance
}

class InitCommand extends Command {
    force;
    constructor(argv) {
        super(argv);
        // localPath = Current file directory: 当前进程运行所在的文件夹，例如在：～/test运行，结果是：/xx/xx/test
        this.localPath = process.cwd() || path.resolve('.');

    }

    // 如果不实现initial，父类中会报错
    initial() {
        const { force } = this._options;
        this.force = force
        console.log('init command -init', this._options, this._cmd)
    }

    async execute() {
        try {
            // 准备阶段
            await this._prepare()
            // 下载模版
            this._downloadTemplate()
            // 安装模版
            this._installTemplate()
        } catch (e) {
            log.error(e.message)
        }
    }

    async _prepare() {
        // 1、判断当前目录是否为空
        const isEmpty = this._isCwdEmpty()
        let isContinue = false;
        // 若是 force：true，无需在过问那么多条件

            // 非空就要去询问用户操作
            if (!isEmpty) {
                if (!this.force) {
                    // 询问是否创建
                    isContinue = (await inquirer.prompt({
                        name: 'isContinue',
                        type: 'confirm',
                        message: '当前文件夹非空，是否继续创建项目？',
                        default: false
                    })).isContinue;
                }
                if (!isContinue) return;
                if (isContinue || this.force) {
                    // 2、是否启动强制更新
                    const { confirmAgain } = await inquirer.prompt([{
                        name: 'confirmAgain',
                        type: 'confirm',
                        message: '会否清空当前目录下的文件？',
                        default: false
                    }])
                    if (confirmAgain) {
                        // 清空当前目录
                        fsExtra.emptyDirSync(this.localPath)
                    }

                }

            }
            await this.getProjectInfo()
    }

    async getProjectInfo() {
        let projectInfo = {}
        // 3、选择创建项目/组件（后期项目平台/物料平台）
        const { type } = await inquirer.prompt({
            name: 'type',
            type: 'list',
            message: '选择初始化类型',
            choices: typeChoices,
        })
        log.info('type', type)
        switch (type) {
            case "project":
                // 4、获取项目的基本信息
                const project = await inquirer.prompt([
                    {
                        type: "input",
                        message: "请输入项目名称",
                        name: "projectName",
                        default: "",
                        validate: function (v) {
                            // 1. 输入的首字符必须为英文字符
                            // 2. 尾字符必须为英文或者数字
                            // 3. 字符只允许"-_"
                            const done = this.async();
                            setTimeout(function () {
                                if (
                                    !/^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
                                        v
                                    )
                                ) {
                                    done("请输入合法的项目名称");
                                    return;
                                }
                                done(null, true);
                            }, 0);
                        },
                        filter: function (v) {
                            return v;
                        },
                    },
                    {
                        type: "input",
                        name: "projectVersion",
                        message: "请输入项目版本号",
                        default: "1.0.0",
                        validate: function (v) {
                            const done = this.async();
                            setTimeout(function () {
                                if (!!!semver.valid(v)) {
                                    done("请输入合法的项目名称");
                                    return;
                                }
                                done(null, true);
                            }, 0);
                        },
                        filter: function (v) {
                            if (!!semver.valid(v)) {
                                return semver.valid(v);
                            } else {
                                return v;
                            }
                        },
                    },
                ]);
                projectInfo = {
                    type,
                    ...project,
                };
                break;
            case "component":
                break;
        }
    }

    _isCwdEmpty() {
        log.module(this.constructor.name, '当前的执行目录', this.localPath)
        //  读出所有的文件列表
        let fileList = fsExtra.readdirSync(this.localPath);
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
