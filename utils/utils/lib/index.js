'use strict';

const { rejects } = require('assert');
const { resolve } = require('path');

function isObject (o) {
    return Object.prototype.toString.call(o) === '[object Object]'
}

function spinnerStart (text = 'loading..') {
    const Spinner = require('cli-spinner').Spinner;
    const spinner = new Spinner(`${text} %s`)
    spinner.setSpinnerString('|/-\\')
    spinner.start()
    return spinner
}

function sleep(timeout) {
    return Promise.resolve(() => setTimeout(() => {}, timeout))
}

function exec_script(command, args, options = {}) {
    const isWin32 = process.platform === 'win32'

    const cmd = isWin32 ? 'cmd' : command
    const comnArgs = isWin32 ? ['/c'].concat(command, args) : args
    console.log('cmd, comnArgs', cmd, comnArgs)
    // 在window下应该是：child_process.spawn('cmd', ['/c', 'node','-e', exec_code], PS：window多个cmd的前缀
    // 在Mac下： child_process.spawn('node', ['-e', exec_code]
    const child = require('child_process').spawn(cmd, comnArgs, options)
    return child;
}

async function execAsync(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const p = exec_script(command, args, options = {})
        // 对 p 的状态进行监听
        p.on('error', (e) => {
            reject(e)
        })

        p.on('exit', (r) => {
            resolve(r)
        })

    })
}



module.exports = {
    isObject,
    spinnerStart,
    sleep,
    execAsync
};
