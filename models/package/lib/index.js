'use strict';
const path = require('path')

const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall')
const pathExists = require('path-exists')

const log = require('@i18n-fe/log')
const utils = require('@i18n-fe/utils')
const { getNpmLatestVersion } = require('@i18n-fe/get-npm-info')

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
        try {
            // 1、对targetPath进行兼容
            const dir = pkgDir(this.targetPath)
            // 2、读取package.json
            if (dir) {
                const pkgPath = path.resolve(dir, 'package.json')
                const pkg = require(pkgPath)
                // 3、找 main/lib的路径
                if (pkg && pkg.main) {
                    const entryPath = path.resolve(dir, pkg.main)
                    // 4、路径兼容 mac&window
                    return formatPath(entryPath)
                }
                return null
            }
            return null
        } catch (e) {
            log.error(e.message)
        }
    }


    async prepare() {
        log.module(this.constructor.name, this.packageName, this.packageVersion)
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersion(this.packageName, this.packageVersion)

        }
    }

    // npm package 是否存在
    async exists() {
        // 如果缓存目录存在，去缓存目录里找
        if(this.storePath) {
            // get lastest version 安装的时候可以用latest，但是查询的时候是以npm-name@x.x.x去找的
            await this.prepare()

            return true
        }
        // 没有缓存目录
        if (this.targetPath) {
            return pathExists(this.targetPath)
        }
    }

    // 安装package
    install() {
        // 异步
        return npminstall({
            root: this.targetPath,
            storeDir: this.storePath,
            registry: getDefaultRegistry(true),
            pkgs: [
                {name: 'foo', version: this.packageVersion},
                // {name: this.packageName, version: this.packageVersion},
            ],
        });
    }

    // 更新package
    update() {

    }

}

module.exports = Package;
