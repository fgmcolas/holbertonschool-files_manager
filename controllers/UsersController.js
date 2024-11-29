import crypto from 'crypto';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class UsersController {
  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.usersCollection.findOne({ _id: new dbClient.ObjectId(userId) });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id.toString(), email: user.email });
  }

  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await dbClient.usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await dbClient.usersCollection.insertOne(newUser);
      return res.status(201).json({ id: result.insertedId.toString(), email: newUser.email });
    } catch (err) {
      return res.status(500).json({ error: 'Error creating user' });
    }
  }
}

export default UsersController;
