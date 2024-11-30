import dbClient from '../utils/db';

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
module.exports = { postNew };
