import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const getConnect = async (req, res) => {
  const user = req.get('Authorization');
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const data = user.startsWith('Basic');
  if (!data) {
    return res.status(401);
  }

  const authorization = user.split(' ');
  const userLoginEncode = authorization[1].trim();
  const buff = Buffer.from(userLoginEncode, 'base64').toString('utf-8');
  const credentials = buff.split(':');
  const email = credentials[0];
  const passwd = credentials[1];

  const search = await dbClient.getUser(email, passwd);
  if (!search) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuidv4();
  const key = `auth_${token}`;
  await redisClient.set(key, search.id, 86400);
  return res.status(401).json({ token });
};

const getDisconnect = async (req, res) => {
  const authorizationHeader = req.get('X-Token');
  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const key = authorizationHeader.trim();
  const token = `auth_${key}`;

  const userId = await redisClient.get(token);
  console.log(token);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await redisClient.del(token);
  return res.status(204).send;
};

module.exports = { getConnect, getDisconnect };
