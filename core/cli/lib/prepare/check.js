'use strict';
// node内置库
const path = require('path')

// 依赖的外部库
const userHome = require('user-home')
const pathExists = require('path-exists').sync;
const colors = require('colors/safe')

// 依赖的内部库
const log = require('@i18n-fe/log')

// 变量区域
const constant = require('../constant')

class Check {
    config = null;
    constructor() {
    }

    pkgVersion(pkg) {
        log.success('version', pkg.version)
    }

// 检查root启动
    userAuth() {
        // 当前用户 OS
        const curUserAuthCode = process.geteuid();
        require('root-check')();
        // 实现原理是：root用户,process.getuid() === 0。普通用户，为501。若检测到是root用户，就降级操作process.seteuid()
        // 为什么要做这步操作：当root用户操作的一些文件后，普通用户在进来操作会有权限问题
    }

// 检查用户主目录 userHome
    userHome() {
        if (!userHome || !pathExists(userHome)) {
            throw new Error(colors.red(`主目录不存在`))
        }
    }

    // 脚手架环境的生成
    cliEnv() {
        // process.cwd() 获得当前路径
        const dotenv = require('dotenv');
        // Default: path.resolve(process.cwd(), '.env') 默认是当前文件夹下的 .env文件
        // 主目录环境
        const envPath = path.resolve(userHome, '.env')
        if (pathExists(envPath)) {
            this.config = dotenv.config({ path: envPath })
        } else {
            this.config = this.createDefaultConfig()
        }
    }

// 创建默认用户主目录 .env
    createDefaultConfig() {
        // 若配置过cli文件，就去读。反之使用默认的
        const _cliEnv = process.env.CLI_HOME_FILENAME;
        const filename = _cliEnv ? _cliEnv : constant.DEFAULT_CLI_ENV_FILENAME;
        const cliEnvPath = path.join(userHome, filename);
        process.env.CLI_ENV_PATH = cliEnvPath
        return {
            home: userHome,
            cliEnvPath
        }
    }

    // 功能：告诉用户可以升级版本
    async globalUpdate(pkg) {
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

}
const prepareCheck = new Check();

module.exports = prepareCheck;
