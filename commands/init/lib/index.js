'use strict';

const log = require('@i18n-fe/log')

function init(name, opts) {
    log.success('init---', name, opts)
}

module.exports = init;
