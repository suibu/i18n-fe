'use strict';
const path = require('path');
const fs = require('fs-extra')

const inquirer = require('inquirer')
const semver = require('semver')
const userHome = require('user-home')
const ejs = require('ejs')

const log = require('@i18n-fe/log')
const Command = require('@i18n-fe/command')
const Package = require('@i18n-fe/package')
const { spinnerStart, sleep, execAsync } = require('@i18n-fe/utils')

const { getProjectTempalte, getComponentTempalte } = require('./server');
const { resolve } = require('path');
const { rejects } = require('assert');

const typeChoices = [
    { name: 'project', type: 'PROJECT' },
    { name: 'component', type: 'COMPONENT' }
]

const WHITE_COMMAND = ['npm', 'yarn', 'cnpm']

function init(argv) {
    console.log('argv', argv)
    const instance = new InitCommand(argv)
    return instance
}

class InitCommand extends Command {
    templateInfo;
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
        // 0、判断项目模版是否存在
        const projectTemplates = await getProjectTempalte();
        console.log('project', projectTemplates)
        // TODO: 组件逻辑
        const componentTemplates = await getComponentTempalte();

        this.projectTemplates = projectTemplates;
        if (!projectTemplates || projectTemplates.length === 0) {
            throw new Error('项目模版不存在')
        }
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
                    fs.emptyDirSync(this.localPath)
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
                    {
                        type: "list",
                        name: "projectTemplate",
                        message: "请选择项目模版",
                        choices: this.createTemplateChoice(),
                    },
                ]);
                projectInfo = {
                    type,
                    ...project,
                };
                this.projectInfo = projectInfo
                break;
            case "component":
                break;
        }
    }

    createTemplateChoice() {
        return this.projectTemplates.map(({ npmName, name }) => ({ name, value: npmName }))
    }

    _isCwdEmpty() {
        log.module(this.constructor.name, '当前的执行目录', this.localPath)
        //  读出所有的文件列表
        let fileList = fs.readdirSync(this.localPath);
        fileList = fileList.filter(filename => {
            const isExceptFile = !(['node_modules'].indexOf(filename) >= 0);
            const isNoOfUseFile = !filename.startsWith('.')
            return isExceptFile && isNoOfUseFile
        })
        log.module(this.constructor.name, fileList)
        return fileList.length === 0;
    }

    // 先把文件下载到缓存目录
    async _downloadTemplate() {
        console.log(this.projectInfo)
        // 在缓存目录下创建template文件夹
        const targetPath = path.resolve(userHome, '.i18n-fe-cli', 'template')
        const storePath = path.resolve(userHome, '.i18n-fe-cli', 'template', 'node_modules')
        const { projectName, projectTemplate } = this.projectInfo
        this.templateInfo = this.projectTemplates.find(item => item.npmName === projectTemplate)
        const { npmName, version } = this.templateInfo;

        this.templateNpm = new Package({
            targetPath,
            storePath,
            name: npmName,
            version
        })
        let spinner

        try {
            // 看要下载的npm是否存在
            if (!await this.templateNpm.exists()) {
                spinner = spinnerStart('正在下载模版...')
                // 让动画执行 1s
                await sleep(1000)
                await this.templateNpm.install()
                spinner.stop(true);

            } else {
                spinner = spinnerStart('正在更新模版...')
                await sleep(1000)
                await this.templateNpm.update();
                spinner.stop(true);

            }
        } catch (e) {
            console.error(e.message)
            throw new Error(e.message)
        } finally {
            console.log('spinner', spinner)
            await this._installTemplate()
        }
    }

    // 将已经缓存的模版进行安装
    async _installTemplate() {
        console.log('templateInfo', this.templateInfo)
        if (!this.templateInfo) throw new Error('没有模版信息，try again')
        const { type = 'normal', npmName, version } = this.templateInfo
        // 自定义模版
        if (type === 'custom') {
            await this._installCustomTemplate()

        } else if (type === 'normal') {
            await this._installNormalTemplate()

        } else {
            throw new Error('无法识别该模版类型')
        }

    }
    // 添加白名单
    checkCommand(command) {
        if (WHITE_COMMAND.indexOf(command) >= 0) {
            return command
        }
        return null
    }

    async execCommand(command, errMsg) {
        const script = command.split(' ')
        let cmd = script[0]
        cmd = this.checkCommand(cmd)
        if (!cmd) throw new Error('命令不存在')

        const args = script.slice(1)
        const res = await execAsync(cmd, args, { stdio: 'inherit', cwd: process.cwd() })
        if (res !== 0) {
            throw new Error(errMsg)
        }
    }

    async _installNormalTemplate() {
        // 安装模版
        const spinner = spinnerStart('正在安装模版...')
        try {
            // 缓存下来的模版的路径
            const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template')
            // 拷贝模版代码到当前目录
            const targetPath = process.cwd()
            // 确保 两个路径均存在
            fs.ensureDirSync(templatePath)
            fs.ensureDirSync(targetPath)
            // 拷贝模版到当前路径下(fs-extra 提供)
            fs.copySync(templatePath, targetPath)

        } catch (error) {
            console.error(error.message)
        } finally {
            spinner.stop(true);
            log.success('模版安装成功')
        }

        const ignore = ['node_modules/**', 'public/**']
        await this.ejsRender({ ignore });

        // const { command: { install, start } } = this.templateInfo
        // // 依赖安装
        // await this.execCommand(install, '依赖安装过程失败')
        // log.success('安装依赖成功，进入启动环节')
        // // 启动命令执行
        // await this.execCommand(start, '启动命令失败')
    }

    async _installCustomTemplate() {
        console.log(this.templateInfo)
    }


    async ejsRender(option) {
        console.log('this.projectInfo', this.projectInfo)
        const { projectName, projectVersion } = this.projectInfo
        const tempalteData = {
            app: { name: projectName, version: projectVersion }
        }
        const { ignore } = option;
        const dir = process.cwd();
        return new Promise((resolve, reject) => {
            require('glob')('**', {
                cwd: dir,
                nodir: true,
                ignore
            }, (err, files) => {
                if (err) {
                    reject(err)
                }
                console.log(files)
                Promise.all(files.map(file => {
                    // 对文件进行 render
                    const filePath = path.join(dir, file)
                    console.log('filePath', filePath)
                    return new Promise((resolve1, reject1) => {

                        ejs.renderFile(filePath, tempalteData, {}, (err, res) => {
                            if (err) {
                                reject1(err)
                            } else {
                                // renderFile 不会真正去修改文件，会返回修改过后的字符串
                                // 拿到结果，重新写入
                                fs.writeFileSync(filePath, res)
                                resolve1(res)
                            }

                        })
                    })
                })).then(() => {
                    resolve()
                }).catch((err) => {
                    console.err(err.message)
                })
            })
        })

    }
}

module.exports = init;
