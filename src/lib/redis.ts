"use server"
const Redis = require('ioredis');

const redis = new Redis({
    host: '192.168.2.165',
    port : 8086
});

module.exports = redis ;