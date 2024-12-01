import { promisify } from 'util';

const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => console.log(error.message));
  }

  async isAlive() {
    return new Promise((resolve, reject) => {
      this.client.ping((err, res) => {
        if (err) reject(err);
        resolve(res === 'PONG');
      });
    });
  }

  async get(key) {
    const getval = promisify(this.client.get).bind(this.client);
    const val = await getval(key);
    return val;
  }

  async set(key, val, duration) {
    await this.client.set(key, val);
    await this.client.expire(key, duration);
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
