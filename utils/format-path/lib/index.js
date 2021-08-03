'use strict';

module.exports = formatPath;

const path = require('path');

// 兼容window/mac的路径
function formatPath(_path) {
    if (_path && typeof _path === 'string') {
        // 分隔符（不同环境的分隔符不同）
        const sep = path.sep;
        // mac
        if (sep === '/') return path
        // window 的连接符替换
        return _path.replace(/\\/g, '/')
    }
    return _path;
}
