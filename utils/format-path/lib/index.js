'use strict';

const path = require('path');
const log = require('@i18n-fe/log')
// 兼容window/mac的路径
function formatPath(_path) {
    try {
        if (_path && typeof _path === 'string') {
            // 分隔符（不同环境的分隔符不同）
            const sep = path.sep;
            // mac
            if (sep === '/') return _path
            // window 的连接符替换
            return path.replace(/\\/g, '/')
        } else {
            throw new Error('formatPath 参数格式错误')
        }
    } catch (e) {
       log.error(e.message)
    }
}
module.exports = formatPath;
