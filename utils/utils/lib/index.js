'use strict';


function utils() {
    console.log('i am utils, im suibu ')
}

function isObject(o) {
    return Object.prototype.toString.call(o) === '[object Object]'
}

module.exports = {
    isObject
};
