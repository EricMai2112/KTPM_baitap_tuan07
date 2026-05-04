const redis = require('redis');
require('dotenv').config();

// Khởi tạo client kết nối đến Redis (Data Grid)
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Đã kết nối thành công tới Redis (Data Grid)'));

// Hàm kết nối
const connectRedis = async () => {
    await redisClient.connect();
};

module.exports = { redisClient, connectRedis };