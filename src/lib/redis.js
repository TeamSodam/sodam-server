const express = require('express');
const redis = require('redis');
const url = 'redis://:' + process.env.REDIS_PASSWORD +'@' + process.env.REDIS_URL + ':' + process.env.REDIS_PORT; 

const redisClient = redis.createClient({
    url: url,
});

module.exports = redisClient