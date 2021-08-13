'use strict';

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

module.exports = {
    isObject,
    spinnerStart
};
