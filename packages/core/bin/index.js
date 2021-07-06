#!/usr/bin/env node

const yargs = require('yargs/yargs')
const dedent = require('dedent')
// const { hideBin } = require('yargs/helpers')
const pkg = require('../package.json')

//hideBin 用于解析参数
// const arg = hideBin(process.argv)

const argv = process.argv.slice(2)
const context = { version: pkg.version  }
const cli = yargs(argv, context);

cli
.strict() // 严格模式，若是出现不匹配的参数，会出现错误提示
.usage('Usage：$0 [command] <options>')
.demandCommand(1, "A command is required. Pass --help to see all available commands and options.")
// demandCommand(至少要输入n个command，提示文案)
.alias('h', 'help')
.alias('v', 'version')
.alias('d', 'debug')
// 命令框的宽度 .wrap(100)
.wrap(cli.terminalWidth())
.epilogue(dedent`
When a command fails, all logs are written to lerna-debug.log in the current working directory.

For more information, find our manual at https://github.com/suibu/i18n-fe
`) //反标号可根据我们书写的格式，直接显示。dedent可让文案全部顶格展示
.options({
  debug: {
    type: 'boolean',
    describe: '启动debug模式',
    alias: 'd'
  }
})
.option('registry', { type: 'string', describe: '定义全局地址', alias: 'r' })
// 分组功能
.group(['debug'], '调试功能')
.group(['registry'], '附加功能')
.command('init [name]', 'do init a project', (yargs) => {
  yargs.option('name', { type: 'string', describe: 'name of a project', alias: 'n' })
}, (argv) => {
  console.log(argv)
})
.recommendCommands()
.fail((msg, err) => {
});