#!/usr/bin/env node

// commander 是个单例， 也可以使用.Command() 创建新的实例
const { program } = require('commander');

const { bin, version } = require('../package.json')
const cliName = Object.keys(bin)[0]
program
    .name(cliName)
    .usage('<command> [options]')
    .version(version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-e, --env <envName>', '环境变量' )
    .parse(process.argv);

console.log(program.envName)