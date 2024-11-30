import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const postNew = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const userEmailExist = await dbClient.userEmailExist(email);
  if (userEmailExist) {
    return res.status(400).json({ error: 'Already exist' });
  }
  const lastInsert = await dbClient.insertNewUser(email, password);
  return res.status(201).json(lastInsert);
};

const getMe = async (req, res) => {
  const authorizationHeader = req.get('X-Token');
  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authorizationHeader.trim();
  const key = `auth_${token}`;
  const userCacheId = await redisClient.get(key);
  if (!userCacheId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = await dbClient.getUserById(userCacheId);
  if (!user) {
    return res.status(401);
  }
  console.log(user);
  return res.json(user);
};

module.exports = { postNew, getMe };
