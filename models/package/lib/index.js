'use strict';
const utils = require('@i18n-fe/utils')

class Package {
    // 包的信息
    packageName = null
    packageVersion = null
    // package的路径
    targetPath = null
    // package的存储路径
    storePath = null
    constructor(options) {
        if (!options || !utils.isObject(options)) {
            throw new Error('package constructor 传参异常')
        }
        const { targetPath, storePath, name, version } = options;
        this.targetPath = targetPath;
        this.storePath = storePath
        this.packageName = name
        this.packageVersion = version

    }

    // 获取入口文件路径
    get entryFilePath() {

    }

    // npm package 是否存在
    exists() {

    }

    // 安装package
    install() {

    }

    // 更新package
    update() {

    }

}
module.exports = Package;
