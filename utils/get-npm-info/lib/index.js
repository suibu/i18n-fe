'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')
const log = require('@i18n-fe/log')

async function getNpmInfo(npmName, registry) {
    if(!npmName) return null
    const domain = registry || getDefaultRegistry()
    const url = urlJoin(domain, npmName)
    log.module('url', url)
    try {
        const res = await axios.get(url)
        const { status, data } = res
        if (status===200) {
            return data;
        }
    } catch (e) {
        log.error('获取npm信息发生错误', e.message)
        return null
    }

}

function getDefaultRegistry(isOrigin = false) {
    const originDomain = 'https://registry.npmjs.org'
    const tbDomain = 'https://registry.npm.taobao.org'
    return isOrigin ? originDomain : tbDomain
}

async function getVersions(name, registry) {
    const { versions = {} } = await getNpmInfo(name, registry)
    const list = Object.keys(versions).sort((prev, next) => semver.gt(next, prev));
    return list;
}

async function getNpmLatestVersion(name, version, registry) {
    const versions = await getVersions(name, registry)
    console.log(versions, version)
    const satisfyVersions = getSemverVersions(version, versions)
    console.log(satisfyVersions)
    if(satisfyVersions && satisfyVersions.length>0) {
        return satisfyVersions[0]
    }
    return '1.0.0'
}

// 返回最新版本的具体版本号
async function getNpmLatestVersionNum(name, registry) {
    const versions = await getVersions(name, registry)
    return versions[0] || '1.0.0'
}

function getSemverVersions(baseVersion, versions) {
    versions = versions.filter(v => semver.satisfies(v, `^${baseVersion}`))
    return versions
}

async function isLatestVersion(name, version, registry) {
    const latestVersion = await getNpmLatestVersion(name, version, registry)
    if (version && semver.gt(latestVersion, version)) {
        return false
    }
    return true;
}

module.exports = {
    getNpmInfo,
    getVersions,
    getNpmLatestVersion,
    getNpmLatestVersionNum,
    isLatestVersion,
    getDefaultRegistry
};