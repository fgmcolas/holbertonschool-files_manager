import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(400).json({ error: 'Invalid Authorization header' });
    }

    const base64Credentials = authHeader.split(' ')[1];

    let credentials;
    try {
      credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Base64 encoding' });
    }

    const [email, password] = credentials.split(':');
    if (!email || !password) {
      return res.status(400).json({ error: 'Invalid Authorization format' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const user = await dbClient.usersCollection.findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const redisKey = `auth_${token}`;

    await redisClient.set(redisKey, user._id.toString(), 24 * 60 * 60); // Store user ID for 24 hours in Redis

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(redisKey);

    return res.status(204).send();
  }
}

export default AuthController;
