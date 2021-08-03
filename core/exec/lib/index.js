'use strict';

module.exports = exec;
const path = require('path')

const log = require('@i18n-fe/log')
const Package = require('@i18n-fe/package')

const SETTING = {
    init: '@i18n-fe/init'
}
const CACHE_DIR = 'dependencies/'

function exec() {
    let targetPath = process.env.CLI_TARGET_PATH
    const envPath = process.env.CLI_ENV_PATH
    let storePath = ''
    log.info('envPath',envPath, 'targetPath', targetPath)
    const commandName = this.name()
    const pkgName = SETTING[commandName]
    const pkgVersion = 'latest'
    if (!targetPath) {
        // 生成缓存路径
        targetPath = path.resolve(envPath, CACHE_DIR);
        storePath = path.resolve(targetPath, 'node_modules');
        console.log('没有传入', targetPath, storePath)
    }

    const pkg = new Package({ targetPath, storePath, name: pkgName, version: pkgVersion });
    log.info('entryFilePath', pkg.entryFilePath)
    if (pkg.exists()) {

    } else {

    }
}
