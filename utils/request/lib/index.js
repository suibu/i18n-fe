'use strict';

const axios = require('axios');

const BASE_URL = process.env.I18N_BASE_URL ? process.env.I18N_BASE_URL : 'http://suibu.com'

const request = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
})

request.interceptors.request.use(
    request => {
        console.log('proxy -request', request)
    },
    error => {
        console.log('proxy -error', error)
        return Promise.reject(error)
    }
)
request.interceptors.response.use(
    response => {
        console.log('proxy -response', response)
    },
    error => {
        console.log('proxy -error', error)
        return Promise.reject(error)
    }
)

module.exports = request;
