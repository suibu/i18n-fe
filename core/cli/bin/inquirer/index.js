#!/usr/bin/env node

 const inquirer = require('inquirer')
console.log(inquirer)

const name = {
 type: 'input', name: 'name', message: 'project name: ', default: 'i18n-fe-project',
 validate: function (name) {
  return name === 'suibu'
 },
 // 补充信息
 transformer: function (name) {
  return `${name}`
 },
 // filter 会改变最终结果
 filter: function (name) {
  return `prefix：${name }`
 }
}

inquirer
    .prompt([name])
    .then((answers) => {
     // Use user feedback for... whatever!!
     console.log('answers', answers)
    })
    .catch((error) => {
     if (error.isTtyError) {
      console.log('isTtyError', error)

     } else {
      console.log('error', error)
      // Something else went wrong
     }
    });