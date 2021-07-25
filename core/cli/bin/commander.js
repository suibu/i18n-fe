#!/usr/bin/env node

// commander 是个单例， 也可以使用.Command() 创建新的实例
const commander = require('commander');
const { program, Command } = commander
const { bin, version } = require('../package.json')
const cliName = Object.keys(bin)[0]
program
    .name(cliName)
    .usage('<command> [options]')
    .version(version)
    .option('-D, --debug', '是否开启调试模式', false)
    .option('-E, --env <envname>', '环境变量' );

// console.log(program._optionValues)


// <> 代表必填参数 []可选项
const clone = program.command('clone <source> [destination]')
clone
    .option('-f, --force', '是否强制')
    .description('clone a repo')
    .action((source, destination, options) => { console.log('clone action',source, destination, options) });

const service = new Command('service')
service
    .command('start [port]')
    .option('-f, --force', '是否强制')
    .action((port, options) => { console.log('service run at port', port, options) });

service
    .command('stop')
    .option('-f, --force', '是否强制')
    .action((port, options) => { console.log('service stop', options) });

program.addCommand(service)


// 必经命令
// program
//     .arguments('[options]')
//     .description('这是一个必经命令', {
//         options: 'options to conf'
//     })
//     .action((options) => {
//         console.log('这是一个必经命令', options)
//     })

// 可实现多个脚手架串行使用，eg：i18n-fe install init -> i18n-fe init
program
    .command(
        'install [name]', 'install package',
        { executableFile: 'i18n-fe', isDefault: false, hidden: true })
    // isDefault:true 会让命令默认执行 i18n-fe，而不是进入上面的必经命令
    // hidden 可以在help文档中看不见相关命令
    .alias('i')

// 自定义help信息
// program.outputHelp()
// program.helpInformation = () => {
//     return '自定义帮助信息\n'
// }
// // 监听命令
// program.on('--help', () => {
//     console.log('help信息，但是我觉得自带的信息格式足够使用了')
// })

// 另一种实现debug的方式
// program.on('--debug', () => {
//     console.log('监听参数 debug')
// })
program.on('option:debug', () => {
    console.log('监听参数 debug')
    process.env.LOG_LEVEL = 'verbose'
    process.env.DEBUG = '1'
})


// 对unknow命令的监听
program.on('command:*', (commands) => {
    const availableCommands = program.commands.map(command => command.name())
    console.log(availableCommands)
    console.error('found unknow command:', commands[0])
    program.outputHelp()

})
program.parse(process.argv);
