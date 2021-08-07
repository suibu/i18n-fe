'use strict';

const log = require('@i18n-fe/log')
const Command = require('@i18n-fe/command')

function init(argv) {
    const instance = new InitCommand(argv)
    return instance
}

class InitCommand extends Command {
    constructor(argv) {
        super(argv);
    }

    // 如果不实现initial，父类中会报错
    initial() {
        console.log('init command -init', this._options, this._cmd)

    }

    execute() {
    }


}

module.exports = init;
