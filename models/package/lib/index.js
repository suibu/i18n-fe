'use strict';
const path = require('path')

const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall')

const utils = require('@i18n-fe/utils')
const formatPath = require('@i18n-fe/format-path')
const {getDefaultRegistry} = require('@i18n-fe/get-npm-info')


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
        const {targetPath, storePath, name, version} = options;
        this.targetPath = targetPath;
        this.storePath = storePath
        this.packageName = name
        this.packageVersion = version

    }

    // 获取入口文件路径(逐层向上查找package.json所在层级)
    get entryFilePath() {
        // 1、对targetPath进行兼容
        const dir = pkgDir(this.targetPath)
        // 2、读取package.json
        if (dir) {
            const pkgPath = path.resolve(dir, 'package.json')
            const pkg = require(pkgPath)
            // 3、找 main/lib的路径
            if (pkg && pkg.main) {
                const path = path.resolve(dir, pkg.main)
                return formatPath(path)
            }
            return null
            // 4、路径兼容 mac&window
        }
        return null
    }

    // npm package 是否存在
    exists() {

    }

    // 安装package
    install() {
        npminstall({
            root: this.targetPath,
            storeDir: this.storePath,
            registry: getDefaultRegistry(true),
            pkgs: [
                {name: this.packageName, version: this.packageVersion},
            ],
        });
    }

    // 更新package
    update() {

    }

}

module.exports = Package;
