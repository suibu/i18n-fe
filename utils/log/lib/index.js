'use strict';

const npmlog = require('npmlog');

// 判断环境变量，输出模式
npmlog.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';
// 前缀文案以及样式
npmlog.heading = 'i18n-fe';
npmlog.headingStyle = { fg: 'white', bg: 'green' }

// 添加自定义命令
npmlog.addLevel('success', 2000, { fg: 'green', bold: true })

npmlog.module = function () {
    const [module, ...message] = arguments
    npmlog.addLevel(module, 1000, { fg: 'yellow', bg: 'white', bold: true }, module)
    const msg = message.join(' ');
    npmlog[module](msg)
}

module.exports = npmlog;
