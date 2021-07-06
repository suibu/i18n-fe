#!/usr/bin/env node
const lib = require('@suibu-i18n-fe/core')

const argv = require('process').argv

const command = argv[2]
const options = argv.slice(3)

// 说明是全局命令
if (command.startsWith('--') || command.startsWith('-')) {
  const globalOption = command.replace(/--|-/g, '')
  if (globalOption === 'version' || globalOption === 'V') {
    console.log('v1.0.0')
  }

}
if (options.length > 1) {
  let [option, param] = options
  option.replace('--', '')
  if (lib[command]) {
    lib[command](option, param)
  } else {
    console.log('输入正确的comamnd')
  }

}
