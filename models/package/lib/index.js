'use strict';
const path = require('path')

const pkgDir = require('pkg-dir').sync;
const npminstall = require('npminstall')
const pathExists = require('path-exists')
const fsExtra = require('fs-extra')

const log = require('@i18n-fe/log')
const utils = require('@i18n-fe/utils')
const { getNpmLatestVersionNum } = require('@i18n-fe/get-npm-info')

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
    entryFilePath() {
            // 如果有缓存文件夹，就去缓存文件夹去找执行文件
            if (this.storePath) {
                return _getRootFile(this.cacheFilePath);
            } else {
                // 反之去找 指定文件夹中的入口文件
                return _getRootFile(this.targetPath);
            }
            function _getRootFile(targetPath) {
                // 1. 获取package.json所在目录
                const dir = pkgDir(targetPath);
                if (dir) {
                    // 2. 读取package.json
                    const pkgFile = require(path.resolve(dir, "package.json"));
                    // 3. 寻找main/lib
                    if (pkgFile && pkgFile.main) {
                        // 4. 路径的兼容(macOS/windows)
                        return formatPath(path.resolve(dir, pkgFile.main));
                    }
                }
                return null;
            }
    }

    get cacheFilePathPrefix() {
        return `${this.packageName.replace('/', '_')}@${this.packageVersion}`
    }

    get cacheFilePath() {
        // _@i18n-fe_init@1.0.18@@i18n-fe/init
        const _p = path.resolve(this.storePath, `_${this.cacheFilePathPrefix}@${this.packageName}`)
        log.module('cacheFilePath', _p)
        return _p
    }

    async prepare() {
        if (this.storePath && !pathExists(this.storePath)) {
            // mkdirp 是将路径上所有的文件都创建好
            fsExtra.mkdirpSync(this.storePath)
        }
        if (this.packageVersion === 'latest') {
            this.packageVersion = await getNpmLatestVersionNum(this.packageName)
        }

    }

    // npm package 是否存在
    async exists() {
        // 如果缓存目录存在，去缓存目录里找
        if(this.storePath) {
            // get lastest version 安装的时候可以用latest，但是查询的时候是以npm-name@x.x.x去找的
            await this.prepare()
            log.module('exists', await pathExists(this.cacheFilePath))
            return await pathExists(this.cacheFilePath);
        }
        // 没有缓存目录
        if (this.targetPath) {
            return pathExists(this.targetPath)
        }
    }

    // 安装package
    async install() {
        // 异步
        await this.prepare()
        log.notice(`正在下载${this.packageName}@${this.packageVersion}`)
        return this.pureInstall(this.packageName, this.packageVersion)
    }

    // 最新版本若存在本地，对应的路径
     specifyVersionPkgCachePath(version) {
        const prefix = `${this.packageName.replace('/', '_')}@${version}`
        const latestPkgPath = path.resolve(this.storePath, `_${prefix}@${this.packageName}`)
        return latestPkgPath;
    }

    // 更新package
    async update() {
        await this.prepare()
        // 判断最新版本是否存在
        // 1、查最新的版本号
        // 2、版本路径是否存在于本地
        const lastestVersion = await getNpmLatestVersionNum(this.packageName)
        const pkgCachePath = this.specifyVersionPkgCachePath(lastestVersion)
        const hasLatestPkg = await pathExists(pkgCachePath)
        if (!hasLatestPkg) {
            log.notice(`正在更新${this.packageName}@${lastestVersion}`)
            await this.pureInstall(this.packageName, lastestVersion)
            this.packageVersion = lastestVersion
        } else {
            this.packageVersion = lastestVersion
        }
        // 如果是最新的，什么都不需要弄
    }

    async pureInstall(name, version) {
        return npminstall({
            root: this.targetPath,
            storeDir: this.storePath,
            registry: getDefaultRegistry(true),
            pkgs: [
                {name, version},
            ],
        });
    }

}

module.exports = Package;
