import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const getStatus = async (req, res) => {
  res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
};

const getStats = async (req, res) => {
  const nbUsers = await dbClient.nbUsers();
  const nbFiles = await dbClient.nbFiles();
  res.status(200).json({ users: nbUsers, files: nbFiles });
};

module.exports = { getStatus, getStats };
