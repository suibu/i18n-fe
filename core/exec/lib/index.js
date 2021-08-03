'use strict';

const path = require('path')

const log = require('@i18n-fe/log')
const Package = require('@i18n-fe/package')

const SETTING = {
    init: '@i18n-fe/init'
}
const CACHE_DIR = 'dependencies/'

async function exec() {
    let targetPath = process.env.CLI_TARGET_PATH
    const envPath = process.env.CLI_ENV_PATH
    let storePath = ''
    let pkg
    const commandName = this.name()
    const pkgName = SETTING[commandName]
    const pkgVersion = 'latest'

    // 没有指定文件，就下载对应的 npm package
    if (!targetPath) {
        // 生成缓存路径
        targetPath = path.resolve(envPath, CACHE_DIR);
        // 生成存储文件夹
        storePath = path.resolve(targetPath, 'node_modules');
        log.module('exec', 'targetPath', targetPath, 'storePath', storePath)
        pkg = new Package({ targetPath, storePath, name: pkgName, version: pkgVersion });
        if (await pkg.exists()) {
            // 更新package
            pkg.update()
        } else {
            // 安装package
            await pkg.install()
        }
    } else {
        // 指定文件去执行
        pkg = new Package({ targetPath, name: pkgName, version: pkgVersion });
        const entryFile = pkg.entryFilePath
        require(entryFile)(pkgName, this.opts())
    }
}
module.exports = exec;
