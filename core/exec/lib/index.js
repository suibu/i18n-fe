'use strict';

module.exports = exec;
const log = require('@i18n-fe/log')
const Package = require('@i18n-fe/package')

const SETTING = {
    init: '@i18n-fe/init'
}

function exec() {
    const targetPath = process.env.CLI_TARGET_PATH
    const envPath = process.env.CLI_ENV_PATH
    log.verbose('envPath',envPath, 'targetPath', targetPath)
    const commandName = this.name()
    const pkgName = SETTING[commandName]
    const pkgVersion = 'latest'

    const pkg = new Package({ targetPath, envPath, name: pkgName, version: pkgVersion });
    log.verbose(pkg)
}
